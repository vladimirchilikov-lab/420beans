const { isConfigured, checkPassword, createToken, parseBody } = require('../lib/admin-auth');

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isConfigured()) {
    return res.status(503).json({
      error: 'not_configured',
      message: 'ADMIN_PASSWORD не е зададена във Vercel (Settings → Environment Variables).',
    });
  }

  const { password } = parseBody(req);

  if (!checkPassword(password)) {
    await sleep(800); // забавя налучкването на парола
    return res.status(401).json({ error: 'bad_password', message: 'Грешна парола' });
  }

  return res.status(200).json({ token: createToken() });
};
