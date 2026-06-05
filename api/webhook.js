const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

async function getRawBody(req) {
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
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
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
