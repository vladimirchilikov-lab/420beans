// api/products.js
// Returns products from Supabase — prices come from DB, not client
// Vercel Serverless Function

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('Products error:', err.message);
    return res.status(500).json({ error: 'Failed to load products' });
  }
};
