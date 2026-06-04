const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { buffer } = require('micro');

module.exports.config = {
  api: {
    bodyParser: false
  }
};

module.exports = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const buf = await buffer(req);

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ONLY handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const sessionId = session.id;

    // Check if order already exists
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (!existing) {
      // Insert new order
      await supabase.from('orders').insert({
        stripe_session_id: sessionId,
        email: session.customer_email,
        total: session.amount_total,
        items: session.metadata || {},
        status: 'paid'
      });
    } else {
      // Update existing order
      await supabase
        .from('orders')
        .update({
          status: 'paid'
        })
        .eq('stripe_session_id', sessionId);
    }
  }

  res.json({ received: true });
};
