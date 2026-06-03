// api/webhook.js
// Stripe Webhook — listens for checkout.session.completed
// Saves orders to Supabase
// Vercel Serverless Function

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Vercel needs raw body for Stripe signature verification
export const config = {
  api: { bodyParser: false },
};

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

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const customerEmail = session.customer_details?.email || 'unknown';
      const total = session.amount_total;
      const items = JSON.parse(session.metadata?.items || '[]');

      // Save order to Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          stripe_session_id: session.id,
          customer_email: customerEmail,
          total,
          status: 'paid',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      console.log(`✅ Order saved: ${order.id} — ${customerEmail} — €${(total/100).toFixed(2)}`);

    } catch (err) {
      console.error('Order save error:', err.message);
      // Return 200 anyway — Stripe will not retry for DB errors
    }
  }

  return res.status(200).json({ received: true });
};
