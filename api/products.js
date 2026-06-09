const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    // CORS (ако го ползваш от фронтенда)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 🔥 Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // ❗ safety check (важно за 500 error debugging)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing SUPABASE env variables');
    }

    // 📦 fetch products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 🔄 transform → frontend format
    const products = (data || []).map(p => ({
      id: p.id,
      category: p.category || 'filter',
      badge: '',
      image: p.image_url || '',
      price: (p.price || 0) / 100, // cents → euros
      roast: 50,
      stripeLink: '',

      en: {
        name: p.name || '',
        region: p.category || '',
        notes: p.description || '',
        process: '',
      },

      bg: {
        name: p.name || '',
        region: p.category || '',
        notes: p.description || '',
        process: '',
      },
    }));

    // ✅ response format (ВАЖНО)
    return res.status(200).json({ products });

  } catch (err) {
    console.error('Products error:', err);

    return res.status(500).json({
      error: 'Failed to load products',
      detail: err.message,
    });
  }
};
