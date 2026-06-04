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
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_WEBHOOK_SECRET
    ) {
      throw new Error('Missing environment variables');
    }

    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const rawBody = await getRawBody(req);

    const signature =
      req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Webhook:', event.type);

    if (
      event.type === 'checkout.session.completed'
    ) {
      const session = event.data.object;

      const order = {
        stripe_session_id: session.id,
        customer_email:
          session.customer_details?.email || null,
        customer_name:
          session.customer_details?.name || null,
        customer_phone:
          session.customer_details?.phone || null,
        shipping_address:
          session.customer_details?.address || null,
        total: session.amount_total,
        status: 'paid'
      };

      const { error } = await supabase
        .from('orders')
        .upsert([order], {
          onConflict: 'stripe_session_id'
        });

      if (error) {
        throw error;
      }

      console.log(
        'Order saved:',
        session.id
      );
    }

    return res.status(200).json({
      received: true
    });

  } catch (err) {
    console.error('Webhook error:', err);

    return res.status(400).json({
      error: err.message
    });
  }
};
