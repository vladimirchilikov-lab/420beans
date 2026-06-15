const { createClient } = require('@supabase/supabase-js');
module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing SUPABASE env variables');
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, price_500, price_1000, image_url, category, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const products = (data || []).map(p => ({
      id: p.id,
      category: p.category || 'filter',
      badge: '',
      image: p.image_url || '',
      price:      p.price      || 0,
      price_500:  p.price_500  || (p.price * 2)  || 0,
      price_1000: p.price_1000 || (p.price * 4)  || 0,
      roast: 50,
      stripeLink: '',
      en: { name: p.name || '', region: p.category || '', notes: p.description || '', process: '' },
      bg: { name: p.name || '', region: p.category || '', notes: p.description || '', process: '' },
    }));

    return res.status(200).json({ products });
  } catch (err) {
    console.error('Products error:', err);
    return res.status(500).json({ error: 'Failed to load products', detail: err.message });
  }
};