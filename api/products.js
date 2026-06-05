const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, roast')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);

  } catch (err) {
    console.error('Products error:', err.message);
    return res.status(500).json({ error: 'Failed to load products', detail: err.message });
  }
};
