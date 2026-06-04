const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const ALLOWED_ORIGIN = 'https://420beans.vercel.app';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    if (
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_KEY
    ) {
      throw new Error('Missing environment variables');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { items = [], email } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'No items provided'
      });
    }

    if (items.length > 30) {
      return res.status(400).json({
        error: 'Too many items'
      });
    }

    const productIds = items.map(i => i.id);

    const { data: products, error } = await supabase
      .from('products')
      .select('id,name,description,price,image_url')
      .in('id', productIds);

    if (error) throw error;

    const lineItems = items.map(item => {
      const product = products.find(
        p => String(p.id) === String(item.id)
      );

      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        throw new Error('Invalid quantity');
      }

      return {
        price_data: {
          currency: 'eur',
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url
              ? [product.image_url]
              : undefined
          }
        },
        quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: lineItems,

      customer_email: email || undefined,

      shipping_address_collection: {
        allowed_countries: [
          'BG',
          'RO',
          'GR',
          'DE',
          'FR',
          'GB'
        ]
      },

      phone_number_collection: {
        enabled: true
      },

      success_url:
        'https://420beans.vercel.app/success.html?session_id={CHECKOUT_SESSION_ID}',

      cancel_url:
        'https://420beans.vercel.app/cancel.html',

      metadata: {
        source: '420beans',
        item_count: String(items.length)
      }
    });

    console.log('Checkout session created:', session.id);

    return res.status(200).json({
      url: session.url
    });

  } catch (err) {
    console.error('Checkout error:', err);

    return res.status(500).json({
      error: 'Checkout failed'
    });
  }
};
