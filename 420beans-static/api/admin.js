const { createClient } = require('@supabase/supabase-js');
const { isConfigured, verifyToken, bearer, parseBody } = require('../lib/admin-auth');

const BUCKET = 'products';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const ORDER_STATUSES = ['paid', 'shipped', 'completed', 'cancelled', 'refunded'];

/* ───────── помощни функции за проверка на входа ───────── */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function str(v, max) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, max);
}

function optStr(v, max) {
  const s = str(v, max);
  return s === '' ? null : s;
}

function cents(v, { required = false, label = 'Цена' } = {}) {
  if (v === undefined || v === null || v === '') {
    if (required) throw new HttpError(400, `${label}: въведи стойност`);
    return null;
  }
  const n = Math.round(Number(v));
  if (!isFinite(n) || n < 0 || n > 10000000) throw new HttpError(400, `${label}: невалидна стойност`);
  return n;
}

function intInRange(v, min, max, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Math.round(Number(v));
  if (!isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/* ───────── продукти ───────── */

const EXTENDED_COLUMNS = [
  'name_bg', 'description_bg', 'region', 'region_bg',
  'process', 'process_bg', 'badge', 'roast', 'sort_order', 'active',
];

async function schemaStatus(supabase) {
  const ext = await supabase.from('products').select(EXTENDED_COLUMNS.join(',')).limit(1);
  const content = await supabase.from('site_content').select('key').limit(1);
  return { productsExtended: !ext.error, siteContent: !content.error };
}

function buildProductPayload(input, extended) {
  const name = str(input.name, 120);
  if (!name) throw new HttpError(400, 'Въведи име на продукта');

  const payload = {
    name,
    description: str(input.description, 1000),
    price: cents(input.price, { required: true, label: 'Цена 250г' }),
    price_500: cents(input.price_500, { label: 'Цена 500г' }),
    price_1000: cents(input.price_1000, { label: 'Цена 1кг' }),
    image_url: str(input.image_url, 1000),
    category: str(input.category, 80),
  };

  if (extended) {
    const badge = str(input.badge, 20);
    payload.name_bg = optStr(input.name_bg, 120);
    payload.description_bg = optStr(input.description_bg, 1000);
    payload.region = optStr(input.region, 160);
    payload.region_bg = optStr(input.region_bg, 160);
    payload.process = optStr(input.process, 160);
    payload.process_bg = optStr(input.process_bg, 160);
    payload.badge = ['bestseller', 'new'].includes(badge) ? badge : null;
    payload.roast = input.roast === '' || input.roast === null || input.roast === undefined
      ? null
      : intInRange(input.roast, 0, 100, null);
    payload.sort_order = intInRange(input.sort_order, -9999, 9999, 0);
    payload.active = input.active === false ? false : true;
  }

  return payload;
}

async function listProducts(supabase) {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  const rows = (data || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return rows;
}

/* ───────── съдържание (текстове и настройки) ───────── */

function cleanTexts(value) {
  const out = { en: {}, bg: {} };
  ['en', 'bg'].forEach(lang => {
    const map = value && typeof value[lang] === 'object' && value[lang] ? value[lang] : {};
    Object.keys(map).forEach(k => {
      if (!/^[A-Za-z0-9_.]{1,60}$/.test(k)) return;
      if (typeof map[k] !== 'string') return;
      out[lang][k] = map[k].slice(0, 2000);
    });
  });
  return out;
}

function cleanUrl(v) {
  const s = str(v, 300);
  if (s === '') return '';
  if (!/^https?:\/\//i.test(s)) throw new HttpError(400, `Невалиден линк: ${s}`);
  return s;
}

function cleanSettings(value) {
  const v = value && typeof value === 'object' ? value : {};
  const out = {};

  const email = str(v.contactEmail, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Невалиден имейл за контакт');
  out.contactEmail = email;

  out.instagramUrl = cleanUrl(v.instagramUrl);
  out.facebookUrl = cleanUrl(v.facebookUrl);
  out.tiktokUrl = cleanUrl(v.tiktokUrl);

  const threshold = Number(v.freeShippingThreshold);
  if (!isFinite(threshold) || threshold < 0 || threshold > 10000) {
    throw new HttpError(400, 'Невалиден праг за безплатна доставка');
  }
  out.freeShippingThreshold = threshold;

  const marquee = Array.isArray(v.marquee) ? v.marquee : [];
  out.marquee = marquee.map(x => str(x, 60)).filter(Boolean).slice(0, 30);

  return out;
}

/* ───────── главен обработчик ───────── */

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isConfigured()) {
    return res.status(503).json({ error: 'not_configured', message: 'ADMIN_PASSWORD не е зададена във Vercel.' });
  }
  if (!verifyToken(bearer(req))) {
    return res.status(401).json({ error: 'unauthorized', message: 'Сесията е изтекла. Влез отново.' });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE env variables' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const body = parseBody(req);
  const action = body.action;

  try {
    switch (action) {

      case 'init': {
        const schema = await schemaStatus(supabase);
        return res.status(200).json({ schema });
      }

      case 'products.list': {
        const schema = await schemaStatus(supabase);
        const products = await listProducts(supabase);
        return res.status(200).json({ products, schema });
      }

      case 'products.save': {
        const schema = await schemaStatus(supabase);
        const payload = buildProductPayload(body.product || {}, schema.productsExtended);
        const id = body.product && body.product.id;

        let result;
        if (id) {
          result = await supabase.from('products').update(payload).eq('id', id).select().single();
        } else {
          result = await supabase.from('products').insert([payload]).select().single();
        }
        if (result.error) throw result.error;

        return res.status(200).json({
          product: result.data,
          extendedSkipped: !schema.productsExtended,
        });
      }

      case 'products.delete': {
        if (!body.id) throw new HttpError(400, 'Липсва id');
        const { error } = await supabase.from('products').delete().eq('id', body.id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      case 'content.get': {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .in('key', ['texts', 'settings']);
        if (error) {
          return res.status(200).json({ texts: {}, settings: {}, available: false });
        }
        const out = { texts: {}, settings: {}, available: true };
        (data || []).forEach(row => { out[row.key] = row.value || {}; });
        return res.status(200).json(out);
      }

      case 'content.save': {
        const key = body.key;
        if (key !== 'texts' && key !== 'settings') throw new HttpError(400, 'Невалиден ключ');
        const value = key === 'texts' ? cleanTexts(body.value) : cleanSettings(body.value);
        const { error } = await supabase
          .from('site_content')
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
        return res.status(200).json({ ok: true, value });
      }

      case 'orders.list': {
        let result = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (result.error) {
          result = await supabase.from('orders').select('*').limit(200);
        }
        if (result.error) throw result.error;
        return res.status(200).json({ orders: result.data || [], statuses: ORDER_STATUSES });
      }

      case 'orders.setStatus': {
        if (!body.id) throw new HttpError(400, 'Липсва id');
        if (!ORDER_STATUSES.includes(body.status)) throw new HttpError(400, 'Невалиден статус');
        const { error } = await supabase.from('orders').update({ status: body.status }).eq('id', body.id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      case 'image.upload': {
        const contentType = str(body.contentType, 40);
        const ext = IMAGE_TYPES[contentType];
        if (!ext) throw new HttpError(400, 'Позволени са само JPG, PNG и WEBP');
        if (typeof body.data !== 'string') throw new HttpError(400, 'Липсват данни за снимката');

        const buffer = Buffer.from(body.data, 'base64');
        if (!buffer.length) throw new HttpError(400, 'Празна снимка');
        if (buffer.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'Снимката е над 3MB');

        const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, buffer, { contentType, cacheControl: '31536000', upsert: false });
        if (error) throw error;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        return res.status(200).json({ url: data.publicUrl });
      }

      default:
        throw new HttpError(400, 'Непознато действие');
    }
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    console.error('Admin error:', action, err.message || err);
    return res.status(status).json({ error: err.message || 'Server error' });
  }
};
