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

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Get product IDs
    const ids = items.map(i => i.id);

    // Fetch real product data (PRICE LOCKED SERVER-SIDE)
    const { data: products, error } = await supabase
      .from('products')
      .select('id,name,description,price,image_url')
      .in('id', ids);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'Products not found' });
    }

    // Build Stripe line items
    const line_items = items.map(i => {
      const product = products.find(p => p.id === i.id);

      if (!product) {
        throw new Error(`Product not found: ${i.id}`);
      }

      return {
        price_data: {
          currency: 'eur',
          unit_amount: product.price, // cents
          product_data: {
            name: product.name,
            description: product.description,
            images: product.image_url ? [product.image_url] : []
          }
        },
        quantity: i.quantity || 1
      };
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: email,

      success_url: `${process.env.SITE_URL}/success.html`,
      cancel_url: `${process.env.SITE_URL}/cancel.html`
    });

    return res.json({ url: session.url });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
