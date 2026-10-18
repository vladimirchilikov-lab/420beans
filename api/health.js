// Лек endpoint за мониторинг — без база данни, за да не пада при проблем със Supabase.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    ok: true,
    service: '420beans',
    ts: new Date().toISOString()
  });
};
