const { createClient } = require('@supabase/supabase-js');

// Публичен endpoint: връща текстовете и настройките, редактирани от админ панела.
// Ако таблицата още не съществува или нещо се обърка, връща празни обекти,
// за да продължи да работи сайтът със стандартните текстове.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const empty = { texts: {}, settings: {} };

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return res.status(200).json(empty);
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['texts', 'settings']);

    if (error) return res.status(200).json(empty);

    const out = { texts: {}, settings: {} };
    (data || []).forEach(row => {
      if (row.key === 'texts' || row.key === 'settings') out[row.key] = row.value || {};
    });
    return res.status(200).json(out);
  } catch (err) {
    console.error('Content error:', err.message);
    return res.status(200).json(empty);
  }
};
