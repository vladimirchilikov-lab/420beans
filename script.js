/* ═══════════════════════════════════════════════════════
   420 BEANS — script.js
   Products loaded dynamically from /api/products (Supabase)
   Texts loaded from _data/texts.json
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   RUNTIME STATE
───────────────────────────────────────────────────────*/
let CATALOG  = {};
let CONFIG   = {
  STRIPE_PUBLISHABLE_KEY: 'pk_test_REPLACE',
  SITE_URL: window.location.origin,
};

// Праг за безплатна доставка в евро
const FREE_SHIPPING_THRESHOLD = 35; // €35 ~ 69лв

/* ─────────────────────────────────────────────────────
   LOAD DATA
───────────────────────────────────────────────────────*/
async function loadData() {
  try {
    const [productsRes, settingsRes, textsRes] = await Promise.all([
      fetch('/api/products'),
      fetch('./_data/settings.json'),
      fetch('./_data/texts.json'),
    ]);

    // Texts
    if (textsRes.ok) {
      const tx = await textsRes.json();
      if (tx.hero) {
        I18N.en['hero.eyebrow'] = tx.hero.eyebrowEN || I18N.en['hero.eyebrow'];
        I18N.bg['hero.eyebrow'] = tx.hero.eyebrowBG || I18N.bg['hero.eyebrow'];
        I18N.en['hero.desc']    = tx.hero.descEN    || I18N.en['hero.desc'];
        I18N.bg['hero.desc']    = tx.hero.descBG    || I18N.bg['hero.desc'];
      }
      if (tx.about) {
        I18N.en['about.label']   = tx.about.labelEN   || I18N.en['about.label'];
        I18N.bg['about.label']   = tx.about.labelBG   || I18N.bg['about.label'];
        I18N.en['about.heading'] = tx.about.headingEN ? tx.about.headingEN.replace(/\n/g,'<br>') : I18N.en['about.heading'];
        I18N.bg['about.heading'] = tx.about.headingBG ? tx.about.headingBG.replace(/\n/g,'<br>') : I18N.bg['about.heading'];
        I18N.en['about.body']    = tx.about.bodyEN    || I18N.en['about.body'];
        I18N.bg['about.body']    = tx.about.bodyBG    || I18N.bg['about.body'];
        I18N.en['about.stat1']   = tx.about.stat1EN   || I18N.en['about.stat1'];
        I18N.bg['about.stat1']   = tx.about.stat1BG   || I18N.bg['about.stat1'];
        I18N.en['about.stat2']   = tx.about.stat2EN   || I18N.en['about.stat2'];
        I18N.bg['about.stat2']   = tx.about.stat2BG   || I18N.bg['about.stat2'];
        I18N.en['about.stat3']   = tx.about.stat3EN   || I18N.en['about.stat3'];
        I18N.bg['about.stat3']   = tx.about.stat3BG   || I18N.bg['about.stat3'];
        I18N.en['about.stat4']   = tx.about.stat4EN   || I18N.en['about.stat4'];
        I18N.bg['about.stat4']   = tx.about.stat4BG   || I18N.bg['about.stat4'];
      }
      if (tx.process) {
        I18N.en['process.body']  = tx.process.bodyEN       || I18N.en['process.body'];
        I18N.bg['process.body']  = tx.process.bodyBG       || I18N.bg['process.body'];
        I18N.en['step1.title']   = tx.process.step1TitleEN || I18N.en['step1.title'];
        I18N.bg['step1.title']   = tx.process.step1TitleBG || I18N.bg['step1.title'];
        I18N.en['step1.desc']    = tx.process.step1DescEN  || I18N.en['step1.desc'];
        I18N.bg['step1.desc']    = tx.process.step1DescBG  || I18N.bg['step1.desc'];
        I18N.en['step2.title']   = tx.process.step2TitleEN || I18N.en['step2.title'];
        I18N.bg['step2.title']   = tx.process.step2TitleBG || I18N.bg['step2.title'];
        I18N.en['step2.desc']    = tx.process.step2DescEN  || I18N.en['step2.desc'];
        I18N.bg['step2.desc']    = tx.process.step2DescBG  || I18N.bg['step2.desc'];
        I18N.en['step3.title']   = tx.process.step3TitleEN || I18N.en['step3.title'];
        I18N.bg['step3.title']   = tx.process.step3TitleBG || I18N.bg['step3.title'];
        I18N.en['step3.desc']    = tx.process.step3DescEN  || I18N.en['step3.desc'];
        I18N.bg['step3.desc']    = tx.process.step3DescBG  || I18N.bg['step3.desc'];
        I18N.en['step4.title']   = tx.process.step4TitleEN || I18N.en['step4.title'];
        I18N.bg['step4.title']   = tx.process.step4TitleBG || I18N.bg['step4.title'];
        I18N.en['step4.desc']    = tx.process.step4DescEN  || I18N.en['step4.desc'];
        I18N.bg['step4.desc']    = tx.process.step4DescBG  || I18N.bg['step4.desc'];
      }
      if (tx.features) {
        ['feat1','feat2','feat3','feat4'].forEach(f => {
          I18N.en[`${f}.title`] = tx.features[`${f}TitleEN`] || I18N.en[`${f}.title`];
          I18N.bg[`${f}.title`] = tx.features[`${f}TitleBG`] || I18N.bg[`${f}.title`];
          I18N.en[`${f}.desc`]  = tx.features[`${f}DescEN`]  || I18N.en[`${f}.desc`];
          I18N.bg[`${f}.desc`]  = tx.features[`${f}DescBG`]  || I18N.bg[`${f}.desc`];
        });
      }
      if (tx.subscribe) {
        I18N.en['sub.label'] = tx.subscribe.labelEN || I18N.en['sub.label'];
        I18N.bg['sub.label'] = tx.subscribe.labelBG || I18N.bg['sub.label'];
        I18N.en['sub.desc']  = tx.subscribe.descEN  || I18N.en['sub.desc'];
        I18N.bg['sub.desc']  = tx.subscribe.descBG  || I18N.bg['sub.desc'];
      }
      if (tx.footer) {
        I18N.en['footer.tagline'] = tx.footer.taglineEN || I18N.en['footer.tagline'];
        I18N.bg['footer.tagline'] = tx.footer.taglineBG || I18N.bg['footer.tagline'];
        I18N.en['footer.copy']    = tx.footer.copyEN    || I18N.en['footer.copy'];
        I18N.bg['footer.copy']    = tx.footer.copyBG    || I18N.bg['footer.copy'];
      }
    }

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

    // Settings
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      if (settings.stripePublishableKey && !settings.stripePublishableKey.includes('REPLACE')) {
        CONFIG.STRIPE_PUBLISHABLE_KEY = settings.stripePublishableKey;
      }
    }

  } catch (err) {
    console.warn('Data load error, using fallback:', err.message);
    useFallbackCatalog();
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
   i18n TRANSLATIONS
───────────────────────────────────────────────────────*/
const I18N = {
  en: {
    'nav.shop': 'Shop', 'nav.process': 'Process', 'nav.subscribe': 'Subscribe',
    'nav.about': 'About', 'nav.cart': 'Cart',
    'hero.eyebrow': 'Specialty Coffee — Est. 2024',
    'hero.title': 'Obsess<em>ively</em><br>Good<br>Coffee.',
    'hero.desc': 'Green coffee selected for flavour complexity and clear single-farm origin.',
    'hero.cta1': 'Shop Now', 'hero.cta2': 'Our Process', 'hero.scroll': 'Scroll',
    'about.label': 'Our Philosophy',
    'about.heading': 'Every cup<br>tells a <em>story.</em>',
    'about.body': 'We source green coffee with clear farm-level origin and roast it to express its natural character.',
    'about.stat1': 'Interesting\nProcess Methods',
    'about.stat2': 'Unique\nFlavour Profiles',
    'about.stat3': 'Farm-to-Roaster\nTraceability',
    'about.stat4': 'Precision\nRoasting',
    'shop.titleLine1': 'The', 'shop.titleLine2': 'Collection',
    'shop.all': 'All', 'shop.filter': 'Coffee', 'shop.espresso': 'Coffee / Espresso', 'shop.merch': 'Merch',
    'shop.bestseller': 'Best Seller', 'shop.new': 'New', 'shop.roastLevel': 'Roast',
    'feat1.title': 'Direct Trade', 'feat1.desc': 'We source directly from producers with clear, traceable farm origin.',
    'feat2.title': 'Roasted to Order', 'feat2.desc': 'Every batch is roasted after your order and delivered on time.',
    'feat3.title': 'Full Transparency', 'feat3.desc': 'Every bag is traceable to its specific farm, harvest, and processing method.',
    'feat4.title': 'Free Shipping over €35', 'feat4.desc': 'Free shipping on all orders over €35. No codes needed.',
    'process.title': 'From<br>Field to<br><em class="text-warm">Cup.</em>',
    'process.body': 'From sourcing to your doorstep — every step is intentional.',
    'step1.title': 'Selection', 'step1.desc': 'We source green coffee lots with clear farm origin and interesting flavour potential.',
    'step2.title': 'Processing', 'step2.desc': 'Natural, washed, or honey — each lot is processed to best express its origin character.',
    'step3.title': 'Roasting', 'step3.desc': 'Small-batch roasting focused on balanced sweetness and expressive flavour notes.',
    'step4.title': 'Delivery', 'step4.desc': 'Roasted to order and shipped fresh — not sitting on a shelf for months.',
    'sub.label': 'Never Run Out',
    'sub.title': 'Fresh coffee.<br><em>On repeat.</em>',
    'sub.desc': 'Subscribe and save 15% on every order. Weekly, bi-weekly, or monthly. Pause or cancel anytime.',
    'sub.placeholder': 'your@email.com', 'sub.btn': 'Subscribe',
    'footer.tagline': 'Specialty coffee with clear single-farm origin. Roasted with obsession. Delivered with care.',
    'footer.col1': 'Shop', 'footer.col2': 'Learn', 'footer.col3': 'Info',
    'footer.allcoffee': 'All Coffee', 'footer.contact': 'Contact',
    'footer.shipping': 'Shipping Policy', 'footer.returns': 'Returns', 'footer.privacy': 'Privacy Policy',
    'footer.copy': '© 2025 420 Beans. All rights reserved.',
    'cart.title': 'Your Cart', 'cart.total': 'Total', 'cart.checkout': 'Proceed to Checkout',
    'cart.empty': 'Your cart is empty.\nDiscover our collection below.',
    'cart.added': 'Added to cart', 'cart.subscribed': 'You\'re subscribed!',
    'checkout.redirecting': 'Redirecting to payment...',
    'checkout.error': 'Could not open payment page. Please try again.',
    'shipping.banner': 'Add €{amount} more for free shipping',
    'shipping.free': '🎉 You have free shipping!',
  },
  bg: {
    'nav.shop': 'Магазин', 'nav.process': 'Процес', 'nav.subscribe': 'Абонамент',
    'nav.about': 'За нас', 'nav.cart': 'Количка',
    'hero.eyebrow': 'Специалти Кафе — Осн. 2024',
    'hero.title': 'Невероятно<br><em>вкусно</em><br>кафе.',
    'hero.desc': 'Зелено кафе, избрано заради вкусова сложност и ясен произход.',
    'hero.cta1': 'Пазарувай', 'hero.cta2': 'Нашият процес', 'hero.scroll': 'Скрол',
    'about.label': 'Нашата философия',
    'about.heading': 'Всяка чаша<br>разказва <em>история.</em>',
    'about.body': 'Избираме зелено кафе с ясен произход и го изпичаме така, че да изрази естествения си характер.',
    'about.stat1': 'Интересни\nМетоди на обработка',
    'about.stat2': 'Уникални\nВкусови профили',
    'about.stat3': 'Проследимост\nФерма до пекар',
    'about.stat4': 'Прецизно\nИзпичане',
    'shop.titleLine1': 'Нашата', 'shop.titleLine2': 'Колекция',
    'shop.all': 'Всички', 'shop.filter': 'Кафе', 'shop.espresso': 'Кафе / Еспресо', 'shop.merch': 'Мърч',
    'shop.bestseller': 'Бестселър', 'shop.new': 'Ново', 'shop.roastLevel': 'Печене',
    'feat1.title': 'Директен произход', 'feat1.desc': 'Избираме директно от производители с ясен проследим произход.',
    'feat2.title': 'Печено по поръчка', 'feat2.desc': 'Всяка партида се пече след поръчката ви и се доставя навреме.',
    'feat3.title': 'Пълна прозрачност', 'feat3.desc': 'Всяка торбичка е проследима до конкретна ферма, реколта и метод на обработка.',
    'feat4.title': 'Безплатна доставка над 69 лв.', 'feat4.desc': 'Безплатна доставка за поръчки над 69 лв. Без кодове.',
    'process.title': 'От<br>полето до<br><em class="text-warm">чашата.</em>',
    'process.body': 'От избора до вашата врата — всяка стъпка е обмислена.',
    'step1.title': 'Подбор', 'step1.desc': 'Избираме партиди зелено кафе с ясен произход и интересен вкусов потенциал.',
    'step2.title': 'Обработка', 'step2.desc': 'Натурален, уош или мед — всяка партида се обработва по начин, който изразява произхода ѝ.',
    'step3.title': 'Печене', 'step3.desc': 'Малки партиди, фокусирани върху балансирана сладост и изразени вкусове.',
    'step4.title': 'Доставка', 'step4.desc': 'Изпечено по поръчка и доставено прясно — не стои на рафт с месеци.',
    'sub.label': 'Никога без кафе',
    'sub.title': 'Прясно кафе.<br><em>Всеки път.</em>',
    'sub.desc': 'Абонирайте се и спестете 15% от всяка поръчка. Седмично, двуседмично или месечно. Спирайте по всяко време.',
    'sub.placeholder': 'вашият@имейл.bg', 'sub.btn': 'Абонирай се',
    'footer.tagline': 'Специалти кафе с ясен произход. Препечено с обсесия. Доставено с грижа.',
    'footer.col1': 'Магазин', 'footer.col2': 'Научи повече', 'footer.col3': 'Информация',
    'footer.allcoffee': 'Всички кафета', 'footer.contact': 'Контакт',
    'footer.shipping': 'Политика за доставка', 'footer.returns': 'Връщане', 'footer.privacy': 'Поверителност',
    'footer.copy': '© 2025 420 Beans. Всички права запазени.',
    'cart.title': 'Вашата количка', 'cart.total': 'Общо', 'cart.checkout': 'Към плащане',
    'cart.empty': 'Количката ви е празна.\nОткрийте нашата колекция по-долу.',
    'cart.added': 'Добавено в количката', 'cart.subscribed': 'Абонирахте се успешно!',
    'checkout.redirecting': 'Пренасочване към плащане...',
    'checkout.error': 'Грешка при плащане. Моля опитайте отново.',
    'shipping.banner': 'Добави още €{amount} за безплатна доставка',
    'shipping.free': '🎉 Имате безплатна доставка!',
  },
};

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