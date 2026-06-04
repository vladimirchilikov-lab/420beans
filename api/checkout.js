const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { items, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const productIds = items.map(i => i.id);
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .in('id', productIds);

    if (error) throw error;
    if (!products?.length) {
      return res.status(400).json({ error: 'Products not found' });
    }

    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) throw new Error(`Product ${item.id} not found`);
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1 || qty > 20) throw new Error('Invalid quantity');
      return {
        price_data: {
          currency: 'eur',
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : [],
          },
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: email || undefined,
      shipping_address_collection: {
        allowed_countries: ['BG', 'DE', 'FR', 'GB', 'GR', 'RO'],
      },
      phone_number_collection: { enabled: true },
      success_url: 'https://420beans.vercel.app/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://420beans.vercel.app/cancel.html',
      metadata: {
        items: JSON.stringify(items),
        source: '420beans',
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
};
