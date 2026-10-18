const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

async function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);

  // Ако runtime-ът вече е парснал JSON-а, точните байтове са загубени и
  // подписът не може да се провери. Затова парсването се изключва по-долу.
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // Check for duplicate
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('orders')
          .insert([{
            stripe_session_id: session.id,
            customer_email: session.customer_details?.email || 'unknown',
            total: session.amount_total,
            status: 'paid',
            items: JSON.parse(session.metadata?.items || '[]'),
          }]);
        if (error) throw error;
        console.log(`✅ Order saved — €${(session.amount_total/100).toFixed(2)}`);
      }
    } catch (err) {
      console.error('Order save error:', err.message);
    }
  }

  return res.status(200).json({ received: true });
};

// Stripe подписва суровите байтове, затова парсването на тялото трябва да е изключено.
module.exports.config = { api: { bodyParser: false } };
