const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { items, email } = req.body;

    if (!items?.length) {
      return res.status(400).json({ error: 'No items' });
    }

    const ids = items.map(i => i.id);

    const { data: products } = await supabase
      .from('products')
      .select('id,name,description,price,image_url')
      .in('id', ids);

    const line_items = items.map(i => {
      const p = products.find(x => x.id === i.id);

      return {
        price_data: {
          currency: 'eur',
          unit_amount: p.price, // already cents
          product_data: {
            name: p.name,
            description: p.description,
            images: p.image_url ? [p.image_url] : []
          }
        },
        quantity: i.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: email,

      success_url: `${process.env.SITE_URL}/success.html`,
      cancel_url: `${process.env.SITE_URL}/cancel.html`
    });

    res.json({ url: session.url });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
