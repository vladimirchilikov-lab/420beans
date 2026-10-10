const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {

    console.log("ENV CHECK", {
      url: !!process.env.SUPABASE_URL,
      key: !!process.env.SUPABASE_SERVICE_KEY
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing SUPABASE env variables');
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // select('*'), за да работи както преди, така и след добавянето на
    // допълнителните колони (name_bg, region, badge, roast, sort_order, active ...)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = (data || [])
      .filter(p => p.active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)); // стабилно сортиране

    const products = rows.map(p => ({
      id: p.id,
      category: p.category || 'filter',
      badge: p.badge || '',
      image: p.image_url || '',
      price: p.price || 0,
      price_500: p.price_500 || (p.price * 2) || 0,
      price_1000: p.price_1000 || (p.price * 4) || 0,
      roast: p.roast === null || p.roast === undefined ? 50 : p.roast,
      stripeLink: '',
      en: {
        name: p.name || '',
        region: p.region || p.category || '',
        notes: p.description || '',
        process: p.process || ''
      },
      bg: {
        name: p.name_bg || p.name || '',
        region: p.region_bg || p.region || p.category || '',
        notes: p.description_bg || p.description || '',
        process: p.process_bg || p.process || ''
      }
    }));

    return res.status(200).json({ products });

  } catch (err) {
    console.error('Products error:', err);
    return res.status(500).json({
      error: 'Failed to load products',
      detail: err.message
    });
  }
};
