/* ═══════════════════════════════════════════════════
   420 BEANS — script.js
   Pure vanilla JS, no dependencies, no build tools
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────
   ★ CONFIGURATION — edit these values
   ───────────────────────────────────────────────── */
const CONFIG = {
  // ↓ Replace with your Stripe PUBLISHABLE key (pk_live_... or pk_test_...)
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY',

  // ↓ Replace with your Stripe Payment Links for each product
  // HOW TO CREATE PAYMENT LINKS:
  //   Stripe Dashboard → Payment Links → Create a link
  //   Set price in BGN, collect shipping address, then paste URL below
  PAYMENT_LINKS: {
    p1: 'https://buy.stripe.com/REPLACE_P1_LINK',
    p2: 'https://buy.stripe.com/REPLACE_P2_LINK',
    p3: 'https://buy.stripe.com/REPLACE_P3_LINK',
  },

  // ↓ Your site's URL (used for success/cancel redirects in Payment Links)
  SITE_URL: window.location.origin,
};

/* ─────────────────────────────────────────────────
   PRODUCT CATALOG
   prices in лв (display only — actual prices set in Stripe)
   ───────────────────────────────────────────────── */
const CATALOG = {
  p1: {
    en: 'Yirgacheffe Dawn',
    bg: 'Йиргачефе Зора',
    price: 28,
    color: 'linear-gradient(170deg, #C8A97A, #A07845)',
  },
  p2: {
    en: 'Huila Nocturne',
    bg: 'Уила Ноктюрн',
    price: 32,
    color: 'linear-gradient(170deg, #E8E0F0, #B8A8D0)',
  },
  p3: {
    en: 'Antigua Dusk',
    bg: 'Антигуа Здрач',
    price: 26,
    color: 'linear-gradient(170deg, #A8C8A0, #688060)',
  },
};

/* ─────────────────────────────────────────────────
   i18n TRANSLATIONS
   ───────────────────────────────────────────────── */
const I18N = {
  en: {
    'nav.shop': 'Shop', 'nav.process': 'Process', 'nav.subscribe': 'Subscribe',
    'nav.about': 'About', 'nav.cart': 'Cart',
    'hero.eyebrow': 'Specialty Coffee — Est. 2024',
    'hero.title': 'Obsess<em>ively</em><br>Good<br>Coffee.',
    'hero.desc': 'Carefully selected high-quality coffee, focused on flavour profile and traceable single-farm origin.',
    'hero.cta1': 'Shop Now', 'hero.cta2': 'Our Process', 'hero.scroll': 'Scroll',
    'about.label': 'Our Philosophy',
    'about.heading': 'Every cup<br>tells a <em>story.</em>',
    'about.body': 'We carefully select high-quality coffee with a focus on flavour profile and traceable origin down to specific farms.',
    'about.stat1': 'Partner Farms', 'about.stat2': 'Origin Countries',
    'about.stat3': 'Farm to Roast', 'about.stat4': 'Roast Precision',
    'shop.titleLine1': 'The', 'shop.titleLine2': 'Collection',
    'shop.all': 'All', 'shop.light': 'Light Roast', 'shop.medium': 'Medium Roast', 'shop.dark': 'Dark Roast',
    'shop.bestseller': 'Best Seller', 'shop.new': 'New',
    'p1.region': 'Ethiopia · Light Roast', 'p1.name': 'Yirgacheffe Dawn', 'p1.notes': 'Bergamot · Peach · Jasmine · Brown Sugar',
    'p2.region': 'Colombia · Medium Roast', 'p2.name': 'Huila Nocturne', 'p2.notes': 'Dark Cherry · Cocoa · Walnut · Vanilla',
    'p3.region': 'Guatemala · Dark Roast', 'p3.name': 'Antigua Dusk', 'p3.notes': 'Cedar · Dark Chocolate · Smoky · Molasses',
    'feat1.title': 'Direct Trade', 'feat1.desc': 'We source directly from producers with verified traceability to specific farms.',
    'feat2.title': 'Roasted Fresh', 'feat2.desc': 'Every batch is roasted to order and ships within 24 hours of your purchase.',
    'feat3.title': 'Traceable Origin', 'feat3.desc': 'Full transparency — every bag is traceable to its specific farm and harvest.',
    'feat4.title': 'Free Shipping', 'feat4.desc': 'Complimentary shipping on all orders over 60 лв. No codes required.',
    'process.title': 'From<br>Field to<br><em style="color:var(--warm)">Cup.</em>',
    'process.body': 'We carefully select high-quality coffee with a focus on flavour profile and traceable origin — from careful selection to your doorstep.',
    'step1.title': 'Selection', 'step1.desc': 'We carefully curate high-quality lots selected for flavour complexity, altitude, and verified farm traceability.',
    'step2.title': 'Processing', 'step2.desc': 'Natural, washed, or honey — each lot is processed using the method that best expresses its origin character.',
    'step3.title': 'Roasting', 'step3.desc': 'Small-batch drum roasters run precision profiles tuned to within 2°C, developing sweetness without sacrificing origin character.',
    'step4.title': 'Delivery', 'step4.desc': 'Nitrogen-flushed, heat-sealed, and shipped same-day. Your coffee arrives at peak freshness — ready to brew.',
    'sub.label': 'Never Run Out',
    'sub.title': 'Fresh coffee.<br><em>On repeat.</em>',
    'sub.desc': 'Subscribe and save 15% on every order. Choose your cadence — weekly, bi-weekly, or monthly. Pause or cancel anytime.',
    'sub.placeholder': 'your@email.com', 'sub.btn': 'Subscribe',
    'reviews.label': 'What People Say',
    'review1.text': 'The Yirgacheffe Dawn is unlike anything I\'ve had — I tasted jasmine and didn\'t believe it until it hit me again on the finish.',
    'review1.author': '— Maria S., Sofia',
    'review2.text': 'I\'ve tried every subscription service. 420 Beans is the only one I\'ve kept for over a year. The freshness is genuinely noticeable.',
    'review2.author': '— Georgi P., Plovdiv',
    'review3.text': 'As a former barista, I\'m difficult to impress. The Huila Nocturne\'s chocolate and cherry balance is competition-worthy.',
    'review3.author': '— Ivelina D., Varna',
    'footer.tagline': 'Specialty coffee with traceable single-farm origin. Roasted with obsession. Delivered with care.',
    'footer.col1': 'Shop', 'footer.col2': 'Learn', 'footer.col3': 'Info',
    'footer.allcoffee': 'All Coffee', 'footer.contact': 'Contact',
    'footer.shipping': 'Shipping Policy', 'footer.returns': 'Returns', 'footer.privacy': 'Privacy Policy',
    'footer.copy': '© 2024 420 Beans. All rights reserved.',
    'cart.title': 'Your Cart', 'cart.total': 'Total', 'cart.checkout': 'Proceed to Checkout',
    'cart.empty': 'Your cart is empty.\nDiscover our collection below.',
    'cart.added': 'Added to cart', 'cart.subscribed': 'You\'re subscribed!',
    'checkout.redirecting': 'Redirecting to payment...',
    'checkout.error': 'Could not open payment page. Please try again.',
    'checkout.multiItem': 'Multiple items: please order one product at a time.',
  },
  bg: {
    'nav.shop': 'Магазин', 'nav.process': 'Процес', 'nav.subscribe': 'Абонамент',
    'nav.about': 'За нас', 'nav.cart': 'Количка',
    'hero.eyebrow': 'Специалти Кафе — Осн. 2024',
    'hero.title': 'Невероятно<br><em>вкусно</em><br>кафе.',
    'hero.desc': 'Подбираме внимателно висококачествено кафе с фокус върху вкусовия профил и проследим произход до конкретни ферми.',
    'hero.cta1': 'Пазарувай', 'hero.cta2': 'Нашият процес', 'hero.scroll': 'Скрол',
    'about.label': 'Нашата философия',
    'about.heading': 'Всяка чаша<br>разказва <em>история.</em>',
    'about.body': 'Подбираме внимателно висококачествено кафе с фокус върху вкусовия профил и проследим произход до конкретни ферми.',
    'about.stat1': 'Партньорски ферми', 'about.stat2': 'Страни на произход',
    'about.stat3': 'Ферма до печене', 'about.stat4': 'Прецизност',
    'shop.titleLine1': 'Нашата', 'shop.titleLine2': 'Колекция',
    'shop.all': 'Всички', 'shop.light': 'Светло печене', 'shop.medium': 'Средно печене', 'shop.dark': 'Тъмно печене',
    'shop.bestseller': 'Бестселър', 'shop.new': 'Ново',
    'p1.region': 'Етиопия · Светло печене', 'p1.name': 'Йиргачефе Зора', 'p1.notes': 'Бергамот · Праскова · Жасмин · Кафява захар',
    'p2.region': 'Колумбия · Средно печене', 'p2.name': 'Уила Ноктюрн', 'p2.notes': 'Тъмна череша · Какао · Орех · Ванилия',
    'p3.region': 'Гватемала · Тъмно печене', 'p3.name': 'Антигуа Здрач', 'p3.notes': 'Кедър · Тъмен шоколад · Опушено · Меласа',
    'feat1.title': 'Директен произход', 'feat1.desc': 'Набираме директно от производители с верифициран проследим произход до конкретна ферма.',
    'feat2.title': 'Прясно препечено', 'feat2.desc': 'Всяка партида се пече по поръчка и се изпраща в рамките на 24 часа.',
    'feat3.title': 'Проследим произход', 'feat3.desc': 'Пълна прозрачност — всяка торбичка е проследима до конкретна ферма и реколта.',
    'feat4.title': 'Безплатна доставка', 'feat4.desc': 'Безплатна доставка за всички поръчки над 60 лв. Без кодове.',
    'process.title': 'От<br>полето до<br><em style="color:var(--warm)">чашата.</em>',
    'process.body': 'Подбираме внимателно висококачествено кафе с фокус върху вкусовия профил и проследим произход до конкретни ферми — от подбора до вашата врата.',
    'step1.title': 'Подбор', 'step1.desc': 'Внимателно подбираме висококачествени партиди по вкусова сложност, altitude и верифициран проследим произход.',
    'step2.title': 'Обработка', 'step2.desc': 'Натурален, промит или honey — всяка партида се обработва по метода, който най-добре изразява характера на произхода.',
    'step3.title': 'Печене', 'step3.desc': 'Малките барабанни пещи работят с прецизни профили до 2°C, развивайки сладост без да жертват характера.',
    'step4.title': 'Доставка', 'step4.desc': 'Запълнено с азот, запечатано и изпратено в същия ден. Пристига в пика на свежест.',
    'sub.label': 'Никога без кафе',
    'sub.title': 'Прясно кафе.<br><em>Всеки път.</em>',
    'sub.desc': 'Абонирайте се и спестете 15% от всяка поръчка. Седмично, двуседмично или месечно. Спирайте по всяко време.',
    'sub.placeholder': 'вашият@имейл.bg', 'sub.btn': 'Абонирай се',
    'reviews.label': 'Какво казват хората',
    'review1.text': 'Йиргачефе Зора е нещо различно — усетих жасмин и не повярвах, докато не ме удари отново на финала.',
    'review1.author': '— Мария С., София',
    'review2.text': 'Пробвала съм всички абонаментни услуги. 420 Beans е единствената, която поддържам над година. Свежестта наистина се усеща.',
    'review2.author': '— Георги П., Пловдив',
    'review3.text': 'Като бивш баристa трудно се впечатлявам. Балансът на Уила Ноктюрн е достоен за състезание.',
    'review3.author': '— Ивелина Д., Варна',
    'footer.tagline': 'Специалти кафе с проследим произход до конкретни ферми. Препечено с обсесия. Доставено с грижа.',
    'footer.col1': 'Магазин', 'footer.col2': 'Научи повече', 'footer.col3': 'Информация',
    'footer.allcoffee': 'Всички кафета', 'footer.contact': 'Контакт',
    'footer.shipping': 'Политика за доставка', 'footer.returns': 'Връщане', 'footer.privacy': 'Поверителност',
    'footer.copy': '© 2024 420 Beans. Всички права запазени.',
    'cart.title': 'Вашата количка', 'cart.total': 'Общо', 'cart.checkout': 'Към плащане',
    'cart.empty': 'Количката ви е празна.\nОткрийте нашата колекция по-долу.',
    'cart.added': 'Добавено в количката', 'cart.subscribed': 'Абонирахте се успешно!',
    'checkout.redirecting': 'Пренасочване към плащане...',
    'checkout.error': 'Неуспешно отваряне на страницата за плащане. Опитайте отново.',
    'checkout.multiItem': 'Моля поръчайте по един продукт наведнъж.',
  },
};

/* ─────────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────────── */
let lang = 'en';
let cart = [];

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
function t(key) {
  return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}

function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}

function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}

/* ─────────────────────────────────────────────────
   i18n
   ───────────────────────────────────────────────── */
function applyTranslations() {
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  $$('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

function setLang(l) {
  lang = l;
  $('#btnBG').classList.toggle('active', l === 'bg');
  $('#btnEN').classList.toggle('active', l === 'en');
  document.documentElement.lang = l;
  applyTranslations();
  updateCartUI();
}

/* ─────────────────────────────────────────────────
   SCROLL: Nav frosted glass effect
   ───────────────────────────────────────────────── */
function initScrollEffects() {
  const nav = $('nav#mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ─────────────────────────────────────────────────
   CUSTOM CURSOR (desktop only)
   ───────────────────────────────────────────────── */
function initCursor() {
  const cursor = $('#cursor');
  const ring   = $('#cursorRing');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    setTimeout(() => {
      ring.style.left = e.clientX + 'px';
      ring.style.top  = e.clientY + 'px';
    }, 80);
  });

  $$('a, button, .product-card, .nav-cart').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
      cursor.style.background = 'var(--warm)';
      ring.style.opacity = '0.8';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = 'var(--ink)';
      ring.style.opacity = '0.4';
    });
  });
}

/* ─────────────────────────────────────────────────
   SCROLL REVEAL
   ───────────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────────────
   FILTER BUTTONS
   ───────────────────────────────────────────────── */
function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────────────
   TOAST
   ───────────────────────────────────────────────── */
function showToast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

/* ─────────────────────────────────────────────────
   ERROR BANNER
   ───────────────────────────────────────────────── */
function showError(msg) {
  const banner = $('#errorBanner');
  if (!banner) return;
  $('#errorMsg').textContent = msg;
  banner.classList.add('show');
  setTimeout(hideError, 6000);
}
function hideError() {
  $('#errorBanner')?.classList.remove('show');
}

/* ─────────────────────────────────────────────────
   CART
   ───────────────────────────────────────────────── */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });

  updateCartUI();
  showToast(t('cart.added'));

  // Badge bounce
  const badge = $('#cartBadge');
  if (badge) {
    badge.style.transform = 'scale(1.6)';
    setTimeout(() => (badge.style.transform = ''), 200);
  }

  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((a, i) => a + i.qty, 0);

  // Update all count elements
  $$('#cartCount').forEach(el => (el.textContent = count));

  const badge = $('#cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  const body   = $('#cartBody');
  const footer = $('#cartFooter');
  if (!body) return;

  if (!cart.length) {
    const [l1, l2 = ''] = t('cart.empty').split('\n');
    body.innerHTML = `<div class="cart-empty">${l1}<br>${l2}</div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  body.innerHTML = cart.map(item => {
    const p    = CATALOG[item.id];
    const name = lang === 'bg' ? p.bg : p.en;
    return `
      <div class="cart-item">
        <div class="cart-item-visual" style="background:${p.color}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${p.price} лв</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">×</button>
      </div>`;
  }).join('');

  const total = cart.reduce((a, i) => a + CATALOG[i.id].price * i.qty, 0);
  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = total.toFixed(2) + ' лв';

  // Re-apply translated labels inside drawer
  const titleEl = $('.cart-title');
  if (titleEl) titleEl.textContent = t('cart.title');
  const totalLabel = $('[data-i18n="cart.total"]');
  if (totalLabel) totalLabel.textContent = t('cart.total');
  const checkoutBtn = $('.btn-checkout');
  if (checkoutBtn) checkoutBtn.textContent = t('cart.checkout');
}

function openCart() {
  $('#cartDrawer')?.classList.add('open');
  $('#overlay')?.classList.add('active');
}

function closeCart() {
  $('#cartDrawer')?.classList.remove('open');
  $('#overlay')?.classList.remove('active');
}

/* ─────────────────────────────────────────────────
   STRIPE CHECKOUT — Frontend-only via Payment Links
   ─────────────────────────────────────────────────
   No backend needed. Uses Stripe Payment Links.

   HOW IT WORKS:
   1. You create a Payment Link in Stripe Dashboard for each product
   2. When user clicks "Checkout", we redirect to that link
   3. If cart has 1 item → go to that product's Payment Link
   4. If cart has multiple items → open Stripe Checkout with line items
      using the Stripe.js redirectToCheckout (requires Price IDs)

   SETUP STEPS:
   A) Simple (Payment Links — no code changes needed):
      - Create a Payment Link per product in Stripe Dashboard
      - Paste URLs in CONFIG.PAYMENT_LINKS above
      - Single-product checkout works out of the box

   B) Multi-product cart (requires Price IDs):
      - Create Products & Prices in Stripe Dashboard
      - Add price IDs to CATALOG below (priceId field)
      - Multi-item checkout will use Stripe.js redirectToCheckout
   ───────────────────────────────────────────────── */

// Optional: add Stripe Price IDs for multi-item checkout
// CATALOG.p1.priceId = 'price_XXXXX';
// CATALOG.p2.priceId = 'price_XXXXX';
// CATALOG.p3.priceId = 'price_XXXXX';

async function startCheckout() {
  if (!cart.length) return;

  const btn = $('#checkoutBtn');
  if (btn) btn.disabled = true;

  // Show loader
  const loader   = $('#checkoutLoader');
  const loaderTxt = $('#loaderText');
  if (loaderTxt) loaderTxt.textContent = t('checkout.redirecting');
  loader?.classList.add('active');
  closeCart();

  try {
    // ── CASE 1: single product, single quantity → Payment Link ──────────
    if (cart.length === 1) {
      const item = cart[0];
      const link = CONFIG.PAYMENT_LINKS[item.id];

      if (!link || link.includes('REPLACE')) {
        throw new Error('payment_link_not_configured');
      }

      // Append quantity param if >1 (Stripe Payment Links support ?prefilled_quantity=N)
      const url = item.qty > 1
        ? `${link}?prefilled_quantity=${item.qty}`
        : link;

      window.location.href = url;
      return; // page will navigate away
    }

    // ── CASE 2: multiple products → Stripe.js redirectToCheckout ────────
    // Requires Price IDs to be set in CATALOG
    const hasPriceIds = cart.every(i => CATALOG[i.id].priceId);
    if (!hasPriceIds) {
      // Fallback: redirect to first item's Payment Link with a note
      const firstItem = cart[0];
      const link = CONFIG.PAYMENT_LINKS[firstItem.id];
      if (link && !link.includes('REPLACE')) {
        showToast(t('checkout.multiItem'));
        loader?.classList.remove('active');
        if (btn) btn.disabled = false;
        openCart();
        return;
      }
      throw new Error('payment_link_not_configured');
    }

    // Use Stripe.js for multi-item checkout (requires publishable key)
    if (CONFIG.STRIPE_PUBLISHABLE_KEY.includes('REPLACE')) {
      throw new Error('stripe_key_not_configured');
    }

    const stripe = Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
    const lineItems = cart.map(item => ({
      price:    CATALOG[item.id].priceId,
      quantity: item.qty,
    }));

    const { error } = await stripe.redirectToCheckout({
      lineItems,
      mode: 'payment',
      successUrl: `${CONFIG.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${CONFIG.SITE_URL}/cancel.html`,
    });

    if (error) throw new Error(error.message);

  } catch (err) {
    loader?.classList.remove('active');
    if (btn) btn.disabled = false;

    let msg = t('checkout.error');
    if (err.message === 'payment_link_not_configured' || err.message === 'stripe_key_not_configured') {
      msg = 'Payment not configured yet. Please add your Stripe Payment Links in script.js';
    }
    showError(msg);
    console.error('Checkout error:', err);
  }
}

/* ─────────────────────────────────────────────────
   SUBSCRIBE (email capture — no backend)
   ───────────────────────────────────────────────── */
function handleSubscribe() {
  const inp = $('#subEmail');
  if (!inp) return;
  if (inp.value && inp.value.includes('@')) {
    showToast(t('cart.subscribed'));
    inp.value = '';
    // TODO: integrate with Mailchimp/ConvertKit/etc. via their embed form
  } else {
    inp.style.borderColor = 'var(--rust)';
    setTimeout(() => (inp.style.borderColor = ''), 1400);
  }
}

/* ─────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  updateCartUI();
  initScrollEffects();
  initCursor();
  initReveal();
  initFilters();
});

/* Expose globals for inline onclick handlers */
window.setLang       = setLang;
window.addToCart     = addToCart;
window.changeQty     = changeQty;
window.removeFromCart = removeFromCart;
window.openCart      = openCart;
window.closeCart     = closeCart;
window.startCheckout = startCheckout;
window.handleSubscribe = handleSubscribe;
window.hideError     = hideError;
