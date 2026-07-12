const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ ok: true, ts: new Date().toISOString() });
};