const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Keepalive error:', error.message);
    return res.status(500).json({ error: 'Database check failed' });
  }

  res.status(200).json({ ok: true, ts: new Date().toISOString() });
};