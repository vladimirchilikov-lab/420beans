/* ═══════════════════════════════════════════════════════
   420 BEANS — script.js
   Products loaded dynamically from /api/products (Supabase)
   Texts: defaults in i18n.js, then _data/texts.json, then admin
   overrides from /api/content. Settings: _data/settings.json + admin.
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   RUNTIME STATE
───────────────────────────────────────────────────────*/
let CATALOG  = {};
let CONFIG   = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE',
  SITE_URL: window.location.origin,
};

// Праг за безплатна доставка в евро (може да се променя от админ панела)
let FREE_SHIPPING_THRESHOLD = 35; // €35 ~ 69лв

/* ─────────────────────────────────────────────────────
   LOAD DATA
───────────────────────────────────────────────────────*/
async function loadData() {
  try {
    const [productsRes, settingsRes, textsRes, contentRes] = await Promise.all([
      fetch('/api/products'),
      fetch('./_data/settings.json'),
      fetch('./_data/texts.json'),
      fetch('/api/content').catch(() => ({ ok: false })),
    ]);

    // Texts: _data/texts.json first, then admin overrides from the database
    if (textsRes.ok) applyTextsJson(await textsRes.json());
    let content = {};
    try { if (contentRes.ok) content = await contentRes.json(); } catch (_) { content = {}; }
    applyTextOverrides(content.texts);

    // Products
    if (productsRes.ok) {
      const raw = await productsRes.json();
      const products = Array.isArray(raw) ? raw : (raw.products || []);
      CATALOG = {};
      products.forEach(p => {
        const enName = p.en?.name || p.name || '';
        const bgName = p.bg?.name || p.name || '';
        CATALOG[p.id] = {
          en:         enName,
          bg:         bgName,
          price:      p.price,
          price_500:  p.price_500,
          price_1000: p.price_1000,
          roast:      p.roast  || 0,
          stripeLink: p.stripeLink || '',
          color:      'linear-gradient(160deg,#1A1512,#2C1810)',
          image:      p.image  || p.image_url || '',
          category:   p.category || 'filter',
          badge:      p.badge  || '',
          _en: p.en || { name: enName, region: p.category || '', notes: p.description || '', process: '' },
          _bg: p.bg || { name: bgName, region: p.category || '', notes: p.description || '', process: '' },
        };
      });
      renderProducts(products);
    }

    // Settings: _data/settings.json first, admin settings from the database on top
    let settings = {};
    if (settingsRes.ok) {
      try { settings = await settingsRes.json(); } catch (_) { settings = {}; }
    }
    settings = { ...settings, ...(content.settings || {}) };
    if (settings.stripePublishableKey && !settings.stripePublishableKey.includes('REPLACE')) {
      CONFIG.STRIPE_PUBLISHABLE_KEY = settings.stripePublishableKey;
    }
    applySiteSettings(settings);

  } catch (err) {
    console.warn('Data load error, using fallback:', err.message);
    useFallbackCatalog();
  }
}

/* ─────────────────────────────────────────────────────
   SITE SETTINGS (contact, socials, free-shipping threshold, marquee)
───────────────────────────────────────────────────────*/
function applySiteSettings(s) {
  if (!s) return;

  const threshold = Number(s.freeShippingThreshold);
  if (isFinite(threshold) && threshold > 0) FREE_SHIPPING_THRESHOLD = threshold;

  if (typeof s.contactEmail === 'string' && s.contactEmail.includes('@')) {
    $$('a[href^="mailto:"]').forEach(a => { a.href = 'mailto:' + s.contactEmail; });
  }

  const socials = { Instagram: s.instagramUrl, Facebook: s.facebookUrl, TikTok: s.tiktokUrl };
  Object.keys(socials).forEach(name => {
    const url = socials[name];
    const link = $(`.footer-social a[aria-label="${name}"]`);
    if (!link) return;
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
    }
  });

  if (Array.isArray(s.marquee) && s.marquee.length) {
    const track = $('.marquee-track');
    if (track) {
      const items = s.marquee.map(x => String(x).trim()).filter(Boolean);
      const once = items
        .map(x => `<span class="marquee-item">${escapeHtml(x)}</span><span class="marquee-dot">·</span>`)
        .join('');
      if (once) track.innerHTML = once + once;
    }
  }
}

/* ─────────────────────────────────────────────────────
   RENDER PRODUCTS
───────────────────────────────────────────────────────*/
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const bagStyles = ['bag-1', 'bag-2', 'bag-3'];
  let bagIdx = 0;
  const delays = ['', 'reveal-delay-1', 'reveal-delay-2'];

  grid.innerHTML = products.map((p, i) => {
    const isMerch = p.category === 'merch';
    const delay   = delays[i % 3];
    const badge   = p.badge === 'bestseller'
      ? `<div class="product-badge" data-i18n="shop.bestseller">Best Seller</div>`
      : p.badge === 'new'
        ? `<div class="product-badge badge-dark" data-i18n="shop.new">New</div>`
        : '';

    let visual = '';
    const productImage = p.image || p.image_url || '';
    const enName = p.en?.name || p.name || '';
    if (productImage) {
      visual = `<div class="product-visual"><img src="${productImage}" alt="${enName}" class="product-img" loading="lazy"></div>`;
    } else if (isMerch) {
      visual = `<div class="product-visual merch-visual merch-${p.id}"><div class="merch-shape"><span class="merch-brand-tag">420 Beans</span><span class="merch-sub-tag">${enName}</span></div></div>`;
    } else {
      const bagClass = bagStyles[bagIdx % bagStyles.length];
      bagIdx++;
      visual = `<div class="product-visual ${bagClass}"><div class="bag-shape"><div class="bag-stripe"></div><div class="bag-circle"><div class="bag-circle-inner"></div></div><div class="bag-label">420B</div></div></div>`;
    }

    const roastBar = (!isMerch && p.roast > 0) ? `
      <div class="product-roast-bar">
        <span class="roast-label" data-i18n="shop.roastLevel">Roast</span>
        <div class="roast-track"><div class="roast-fill" data-roast="${p.roast}"></div></div>
      </div>` : '';

    const enProcess = p.en?.process || '';
    const processTag = (!isMerch && enProcess) ? `<p class="product-process" data-product-id="${p.id}" data-field="process">${enProcess}</p>` : '';
    const enRegion = p.en?.region || p.category || '';
    const enNotes  = p.en?.notes  || p.description || '';

    // Weight selector — само за кафе, не мърч
    const price250 = (p.price || 0) / 100;
    const price500 = (p.price_500 || p.price * 2 || 0) / 100;
    const price1000 = (p.price_1000 || p.price * 4 || 0) / 100;

    const weightSelector = !isMerch ? `
      <div class="weight-selector" onclick="event.stopPropagation()">
        <button class="weight-btn active" data-weight="250" data-price="${p.price}" onclick="selectWeight(this, '${p.id}')">250г</button>
        <button class="weight-btn" data-weight="500" data-price="${p.price_500 || p.price * 2}" onclick="selectWeight(this, '${p.id}')">500г</button>
        <button class="weight-btn" data-weight="1000" data-price="${p.price_1000 || p.price * 4}" onclick="selectWeight(this, '${p.id}')">1кг</button>
      </div>` : '';

    return `
    <article class="product-card ${isMerch ? 'product-card-merch' : ''} reveal ${delay}"
             data-category="${p.category || 'filter'}"
             data-product-id="${p.id}"
             onclick="addToCart('${p.id}')">
      ${visual}
      ${badge}
      <div class="product-info">
        <p class="product-region" data-product-id="${p.id}" data-field="region">${enRegion}</p>
        <h3 class="product-name" data-product-id="${p.id}" data-field="name">${enName}</h3>
        ${processTag}
        <p class="product-notes" data-product-id="${p.id}" data-field="notes">${enNotes}</p>
        ${roastBar}
        ${weightSelector}
        <div class="product-footer">
          <span class="product-price" id="price-${p.id}">€${price250.toFixed(2)}</span>
          <button class="product-add"
                  onclick="event.stopPropagation(); addToCart('${p.id}')"
                  aria-label="Add to cart">+</button>
        </div>
      </div>
    </article>`;
  }).join('');

  initReveal();
  initFilters();
  initRoastBars();
  initCursor();
  applyProductLanguage();
}

/* ─────────────────────────────────────────────────────
   WEIGHT SELECTOR
───────────────────────────────────────────────────────*/
// Пази избраното тегло и цена за всеки продукт
const selectedWeight = {}; // { productId: { weight: 250, price: 1200 } }

function selectWeight(btn, productId) {
  // Деактивирай останалите бутони в същия selector
  const selector = btn.closest('.weight-selector');
  selector.querySelectorAll('.weight-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const weight = parseInt(btn.getAttribute('data-weight'));
  const price  = parseInt(btn.getAttribute('data-price'));

  selectedWeight[productId] = { weight, price };

  // Обнови показаната цена
  const priceEl = document.getElementById(`price-${productId}`);
  if (priceEl) priceEl.textContent = `€${(price / 100).toFixed(2)}`;
}

function getSelectedWeight(productId) {
  return selectedWeight[productId] || { weight: 250, price: CATALOG[productId]?.price || 0 };
}

/* ─────────────────────────────────────────────────────
   APPLY LANGUAGE TO DYNAMIC PRODUCT TEXT
───────────────────────────────────────────────────────*/
function applyProductLanguage() {
  $$('[data-product-id][data-field]').forEach(el => {
    const id    = el.getAttribute('data-product-id');
    const field = el.getAttribute('data-field');
    const prod  = CATALOG[id];
    if (!prod) return;
    const translations = lang === 'bg' ? prod._bg : prod._en;
    if (translations && translations[field] !== undefined) {
      el.textContent = translations[field];
    }
  });
}

/* ─────────────────────────────────────────────────────
   FALLBACK CATALOG
───────────────────────────────────────────────────────*/
function useFallbackCatalog() {
  CATALOG = {
    p1: { en:'Jimma Makhore', bg:'Джима Махоре', price:1400, price_500:2800, price_1000:5600, color:'linear-gradient(170deg,#C8A97A,#A07845)', stripeLink:'', image:'' },
    p2: { en:'Huila Nocturne', bg:'Уила Ноктюрн', price:1600, price_500:3200, price_1000:6400, color:'linear-gradient(170deg,#E8E0F0,#B8A8D0)', stripeLink:'', image:'' },
  };
}


/* ─────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────*/
let lang = localStorage.getItem('lang') || 'bg';
let cart = [];

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────*/
function t(key) { return I18N[lang]?.[key] ?? I18N.en[key] ?? key; }
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

/* ─────────────────────────────────────────────────────
   i18n
───────────────────────────────────────────────────────*/
function applyTranslations() {
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  $$('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
}

function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  $('#btnBG').classList.toggle('active', l === 'bg');
  $('#btnEN').classList.toggle('active', l === 'en');
  document.documentElement.lang = l;
  applyTranslations();
  applyProductLanguage();
  updateCartUI();
}

/* ─────────────────────────────────────────────────────
   SHIPPING BANNER
───────────────────────────────────────────────────────*/
function updateShippingBanner() {
  const banner = $('#shipping-banner');
  if (!banner) return;

  const total = cart.reduce((a, i) => {
    const w = getSelectedWeight(i.id);
    return a + (w.price / 100) * i.qty;
  }, 0);

  const remaining = FREE_SHIPPING_THRESHOLD - total;

  if (remaining <= 0) {
    banner.textContent = t('shipping.free');
    banner.style.background = '#2a4a1a';
    banner.style.color = '#c8f04a';
  } else {
    const msg = t('shipping.banner').replace('{amount}', remaining.toFixed(2));
    banner.textContent = msg;
    banner.style.background = '#1a1a1a';
    banner.style.color = '#f0f0f0';
  }
  banner.style.display = 'block';
}

/* ─────────────────────────────────────────────────────
   SCROLL EFFECTS
───────────────────────────────────────────────────────*/
function initScrollEffects() {
  const nav = $('nav#mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────────────────*/
function initCursor() {
  const cursor = $('#cursor');
  const ring   = $('#cursorRing');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    setTimeout(() => { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }, 80);
  });
  $$('a, button, .product-card, .nav-cart').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2.2)'; cursor.style.background = 'var(--warm)'; ring.style.opacity = '0.8'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; cursor.style.background = 'var(--ink)'; ring.style.opacity = '0.4'; });
  });
}

/* ─────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────*/
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────────
   FILTER BUTTONS
───────────────────────────────────────────────────────*/
function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter') || 'all';
      $$('.product-card').forEach(card => {
        if (filter === 'all') { card.classList.remove('hidden'); return; }
        const cats = (card.getAttribute('data-category') || '').split(' ');
        card.classList.toggle('hidden', !cats.includes(filter));
      });
    });
  });
}

/* ─────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────*/
function showToast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

/* ─────────────────────────────────────────────────────
   ERROR BANNER
───────────────────────────────────────────────────────*/
function showError(msg) {
  const banner = $('#errorBanner');
  if (!banner) return;
  $('#errorMsg').textContent = msg;
  banner.classList.add('show');
  setTimeout(hideError, 6000);
}
function hideError() { $('#errorBanner')?.classList.remove('show'); }

/* ─────────────────────────────────────────────────────
   CART
───────────────────────────────────────────────────────*/
function addToCart(id) {
  const sel = getSelectedWeight(id);
  // Търси вече добавен продукт със същото тегло
  const item = cart.find(i => i.id === id && i.weight === sel.weight);
  if (item) item.qty++;
  else cart.push({ id, qty: 1, weight: sel.weight, price: sel.price });

  updateCartUI();
  showToast(t('cart.added'));

  const badge = $('#cartBadge');
  if (badge) {
    badge.style.transform = 'scale(1.6)';
    setTimeout(() => (badge.style.transform = ''), 200);
  }
  openCart();
}

function changeQty(id, weight, delta) {
  const item = cart.find(i => i.id === id && i.weight === weight);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => !(i.id === id && i.weight === weight));
  updateCartUI();
}

function removeFromCart(id, weight) {
  cart = cart.filter(i => !(i.id === id && i.weight === weight));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  $$('#cartCount').forEach(el => (el.textContent = count));
  const badge = $('#cartBadge');
  if (badge) { badge.textContent = count; badge.classList.toggle('visible', count > 0); }

  const body   = $('#cartBody');
  const footer = $('#cartFooter');
  if (!body) return;

  if (!cart.length) {
    const [l1, l2 = ''] = t('cart.empty').split('\n');
    body.innerHTML = `<div class="cart-empty">${l1}<br>${l2}</div>`;
    if (footer) footer.style.display = 'none';
    updateShippingBanner();
    return;
  }

  if (footer) footer.style.display = 'block';

  body.innerHTML = cart.map(item => {
    const p    = CATALOG[item.id];
    if (!p) return '';
    const name = lang === 'bg' ? p.bg : p.en;
    const img  = p.image
      ? `<img src="${p.image}" alt="${name}" class="cart-item-visual" style="object-fit:cover">`
      : `<div class="cart-item-visual" style="background:${p.color}"></div>`;
    const weightLabel = item.weight === 1000 ? '1кг' : `${item.weight}г`;
    return `
      <div class="cart-item">
        ${img}
        <div class="cart-item-info">
          <div class="cart-item-name">${name} <span style="opacity:0.5;font-size:11px">${weightLabel}</span></div>
          <div class="cart-item-price">€${(item.price / 100).toFixed(2)}</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty('${item.id}', ${item.weight}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', ${item.weight}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}', ${item.weight})">×</button>
      </div>`;
  }).join('');

  const total = cart.reduce((a, i) => a + (i.price / 100) * i.qty, 0);
  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = '€' + total.toFixed(2);

  const titleEl = $('.cart-title');
  if (titleEl) titleEl.textContent = t('cart.title');
  const totalLabel = $('[data-i18n="cart.total"]');
  if (totalLabel) totalLabel.textContent = t('cart.total');
  const checkoutBtn = $('.btn-checkout');
  if (checkoutBtn) checkoutBtn.textContent = t('cart.checkout');

  updateShippingBanner();
}

function openCart()  { $('#cartDrawer')?.classList.add('open');    $('#overlay')?.classList.add('active'); }
function closeCart() { $('#cartDrawer')?.classList.remove('open'); $('#overlay')?.classList.remove('active'); }

/* ─────────────────────────────────────────────────────
   STRIPE CHECKOUT
───────────────────────────────────────────────────────*/
async function startCheckout() {
  if (!cart.length) return;
  const btn = $('#checkoutBtn');
  if (btn) btn.disabled = true;
  const loader    = $('#checkoutLoader');
  const loaderTxt = $('#loaderText');
  if (loaderTxt) loaderTxt.textContent = t('checkout.redirecting');
  loader?.classList.add('active');
  closeCart();

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ id: i.id, quantity: i.qty, weight: i.weight })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error');
    }
    const { url } = await res.json();
    if (!url) throw new Error('No checkout URL');
    window.location.href = url;
  } catch (err) {
    loader?.classList.remove('active');
    if (btn) btn.disabled = false;
    showError(t('checkout.error'));
    console.error('Checkout error:', err);
  }
}

/* ─────────────────────────────────────────────────────
   SUBSCRIBE
───────────────────────────────────────────────────────*/
function handleSubscribe() {
  const inp = $('#subEmail');
  if (!inp) return;
  if (inp.value && inp.value.includes('@')) {
    showToast(t('cart.subscribed'));
    inp.value = '';
  } else {
    inp.style.borderColor = 'var(--rust)';
    setTimeout(() => (inp.style.borderColor = ''), 1400);
  }
}

/* ─────────────────────────────────────────────────────
   ROAST BARS
───────────────────────────────────────────────────────*/
function initRoastBars() {
  $$('[data-roast]').forEach(el => {
    const pct = parseInt(el.getAttribute('data-roast'), 10);
    if (!isNaN(pct)) el.style.width = pct + '%';
  });
}

/* ─────────────────────────────────────────────────────
   COFFEE ADVISOR CHAT
───────────────────────────────────────────────────────*/
let chatHistory = [];        // {role, content} за API-то
let chatOpen = false;
let chatBusy = false;
let chatGreeted = false;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function appendChatMessage(role, text) {
  const body = $('#chatBody');
  if (!body) return;
  const el = document.createElement('div');
  el.className = `chat-msg ${role}`;
  el.innerHTML = escapeHtml(text);
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}

function showChatTyping() {
  const body = $('#chatBody');
  if (!body) return;
  const el = document.createElement('div');
  el.className = 'chat-typing';
  el.id = 'chatTyping';
  el.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function hideChatTyping() {
  $('#chatTyping')?.remove();
}

function toggleChat() { chatOpen ? closeChat() : openChat(); }

function openChat() {
  chatOpen = true;
  $('#chatDrawer')?.classList.add('open');
  $('#chatLauncher')?.classList.add('open');
  if (!chatGreeted) {
    chatGreeted = true;
    appendChatMessage('bot', t('chat.greeting'));
  }
  setTimeout(() => $('#chatInput')?.focus(), 200);
}

function closeChat() {
  chatOpen = false;
  $('#chatDrawer')?.classList.remove('open');
  $('#chatLauncher')?.classList.remove('open');
}

async function sendChatMessage() {
  const input = $('#chatInput');
  const btn = $('#chatSendBtn');
  if (!input || chatBusy) return;
  const text = input.value.trim();
  if (!text) return;

  appendChatMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  input.value = '';
  chatBusy = true;
  if (btn) btn.disabled = true;
  showChatTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory, lang }),
    });
    const data = await res.json();
    hideChatTyping();
    if (!res.ok || !data.reply) throw new Error(data.error || 'Chat failed');
    appendChatMessage('bot', data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    hideChatTyping();
    appendChatMessage('error', t('chat.error'));
    console.warn('Chat error:', err.message);
  } finally {
    chatBusy = false;
    if (btn) btn.disabled = false;
    input.focus();
  }
}

function initChat() {
  $('#chatInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
}

/* ─────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  applyTranslations();
  applyProductLanguage();
  updateCartUI();
  initScrollEffects();
  initCursor();
  initReveal();
  initFilters();
  initRoastBars();
  initChat();
  setLang(lang); // прилага активния бутон
});

/* Expose globals */
window.setLang        = setLang;
window.addToCart      = addToCart;
window.changeQty      = changeQty;
window.removeFromCart = removeFromCart;
window.openCart       = openCart;
window.closeCart      = closeCart;
window.startCheckout  = startCheckout;
window.handleSubscribe = handleSubscribe;
window.hideError      = hideError;
window.selectWeight   = selectWeight;
window.toggleChat     = toggleChat;
window.openChat       = openChat;
window.closeChat      = closeChat;
window.sendChatMessage = sendChatMessage;