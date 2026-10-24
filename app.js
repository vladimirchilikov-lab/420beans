/* ============================================================
   420 BEANS v2 — App Logic
   ============================================================ */

// ---- State ----
const STATE = {
  lang: localStorage.getItem('420b_lang') || 'bg',
  cart: [],
  products: [],
  chatHistory: [],
  chatOpen: false,
};

const CART_KEY = '420beans_cart_v2';

// ---- i18n ----
const T = {
  bg: {
    shopCoffee: 'Разгледай кафетата',
    ourStory: 'Нашата история',
    featuredTitle: 'Избрани кафета',
    featuredLabel: 'Специалти селекция',
    discoveryTitle: 'Намери своето кафе',
    discoveryLabel: 'Помощ при избор',
    brandTitle: 'Кафе с характер',
    brandBody: 'Подбираме специалти кафе от конкретни ферми по света — кафе с ясен произход, интересна история и изразен вкус. Изпичаме го прясно и го изпращаме директно до теб.',
    trustShipping: 'Бърза доставка',
    trustShippingDesc: 'Куриерска доставка 1-3 дни',
    trustFresh: 'Прясно изпечено',
    trustFreshDesc: 'Изпичаме след поръчка',
    trustOrigin: 'Проследим произход',
    trustOriginDesc: 'До конкретна ферма',
    trustPayment: 'Сигурно плащане',
    trustPaymentDesc: 'Stripe • Карта • eBanking',
    cartTitle: 'Количка',
    cartEmpty: 'Количката е празна',
    cartCheckout: 'Към плащане',
    cartSubtotal: 'Стойност',
    cartShipping: 'Доставка',
    cartShippingFree: 'Безплатна',
    cartTotal: 'Общо',
    cartNote: 'Изпичаме след потвърждение на поръчката',
    addToCart: 'Добави в количка',
    addedToCart: '✓ Добавено',
    loading: 'Зарежда...',
    noProducts: 'Няма намерени продукти',
    chatGreeting: 'Здравей! Аз съм кафе-асистентът на 420 Beans. Помагам при избор на кафе, методи на приготвяне и всичко свързано с кафето. Попитай ме нещо! ☕',
    chatPlaceholder: 'Попитай за кафе...',
    chatError: 'Извинявай, имам технически проблем. Пробвай пак след малко.',
    origin: 'Произход',
    process: 'Обработка',
    roast: 'Печене',
    elevation: 'Надм. вис.',
    variety: 'Сорт',
    flavorNotes: 'Вкусови нотки',
    addedMsg: 'Добавено в количката',
    espresso: 'Еспресо',
    filter: 'Филтър',
    fruity: 'Плодово & Флорално',
    chocolate: 'Шоколад & Сладко',
    experimental: 'Експериментално',
    shopTitle: 'Всички кафета',
    sortDefault: 'По подразбиране',
    sortPriceAsc: 'Цена: ниска → висока',
    sortPriceDesc: 'Цена: висока → ниска',
    sortName: 'По азбучен ред',
    filterBrewMethod: 'Метод на приготвяне',
    filterOrigin: 'Произход',
    filterRoast: 'Степен на печене',
    filtersMobile: 'Филтри',
    products: 'продукта',
    fromLabel: 'от',
    perGLabel: '/250g',
    announcementBar: 'Прясно изпечено кафе • Доставка с куриер • Поръчай сега →',
  },
  en: {
    shopCoffee: 'Shop Coffee',
    ourStory: 'Our Story',
    featuredTitle: 'Featured Coffees',
    featuredLabel: 'Specialty Selection',
    discoveryTitle: 'Find Your Coffee',
    discoveryLabel: 'Coffee Advisor',
    brandTitle: 'Coffee with Character',
    brandBody: 'We source specialty coffee from specific farms around the world — coffee with a clear origin, an interesting story, and an expressive flavour. Roasted fresh and shipped directly to you.',
    trustShipping: 'Fast Delivery',
    trustShippingDesc: 'Courier delivery 1–3 days',
    trustFresh: 'Roasted Fresh',
    trustFreshDesc: 'Roasted after your order',
    trustOrigin: 'Traceable Origin',
    trustOriginDesc: 'Down to the specific farm',
    trustPayment: 'Secure Payment',
    trustPaymentDesc: 'Stripe • Card • eBanking',
    cartTitle: 'Cart',
    cartEmpty: 'Your cart is empty',
    cartCheckout: 'Proceed to Checkout',
    cartSubtotal: 'Subtotal',
    cartShipping: 'Shipping',
    cartShippingFree: 'Free',
    cartTotal: 'Total',
    cartNote: 'Roasted after order confirmation',
    addToCart: 'Add to Cart',
    addedToCart: '✓ Added',
    loading: 'Loading...',
    noProducts: 'No products found',
    chatGreeting: 'Hi! I\'m the 420 Beans coffee advisor. I\'ll help you choose coffee, brewing methods, and anything coffee-related. Ask me something! ☕',
    chatPlaceholder: 'Ask about coffee...',
    chatError: 'Sorry, I\'m having a technical issue. Please try again in a moment.',
    origin: 'Origin',
    process: 'Process',
    roast: 'Roast',
    elevation: 'Elevation',
    variety: 'Variety',
    flavorNotes: 'Flavour notes',
    addedMsg: 'Added to cart',
    espresso: 'Espresso',
    filter: 'Filter',
    fruity: 'Fruity & Floral',
    chocolate: 'Chocolate & Sweet',
    experimental: 'Experimental',
    shopTitle: 'All Coffees',
    sortDefault: 'Default',
    sortPriceAsc: 'Price: low → high',
    sortPriceDesc: 'Price: high → low',
    sortName: 'Alphabetical',
    filterBrewMethod: 'Brew Method',
    filterOrigin: 'Origin',
    filterRoast: 'Roast Level',
    filtersMobile: 'Filters',
    products: 'products',
    fromLabel: 'from',
    perGLabel: '/250g',
    announcementBar: 'Freshly roasted coffee • Courier delivery • Order now →',
  }
};
const t = (key) => (T[STATE.lang] || T.bg)[key] || key;

// ---- Cart persistence ----
function loadCart() {
  try { STATE.cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { STATE.cart = []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(STATE.cart)); } catch {}
}

// ---- Cart operations ----
function cartAdd(product, size, price) {
  const id = `${product.id}_${size}`;
  const existing = STATE.cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    STATE.cart.push({
      id,
      productId: product.id,
      name: STATE.lang === 'bg' ? (product.name_bg || product.name) : (product.name_en || product.name),
      size,
      price,
      image: product.image_url || '',
      qty: 1,
    });
  }
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`☕ ${t('addedMsg')}`, 'success');
}
function cartRemove(id) {
  STATE.cart = STATE.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
}
function cartQty(id, delta) {
  const item = STATE.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  updateCartCount();
}
function cartTotal() {
  return STATE.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}
function updateCartCount() {
  const total = STATE.cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ---- Cart render ----
function renderCart() {
  const el = document.getElementById('cart-items');
  if (!el) return;
  if (STATE.cart.length === 0) {
    el.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">☕</div><p>${t('cartEmpty')}</p></div>`;
  } else {
    el.innerHTML = STATE.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : '<div style="width:100%;height:100%;background:var(--bg-alt);"></div>'}
        </div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.size}</div>
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="cartQty('${item.id}',-1)">−</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button class="cart-qty-btn" onclick="cartQty('${item.id}',1)">+</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--sp-2)">
          <div class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="cartRemove('${item.id}')" title="Премахни">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  }
  const subtotal = cartTotal();
  const freeShipping = subtotal >= 30;
  const el2 = document.getElementById('cart-subtotal'); if (el2) el2.textContent = `€${subtotal.toFixed(2)}`;
  const el3 = document.getElementById('cart-shipping'); if (el3) el3.textContent = freeShipping ? t('cartShippingFree') : '€4.99';
  const el4 = document.getElementById('cart-total'); if (el4) el4.textContent = `€${(subtotal + (freeShipping ? 0 : 4.99)).toFixed(2)}`;
}

// ---- Checkout ----
async function startCheckout() {
  if (STATE.cart.length === 0) return;
  const btn = document.getElementById('checkout-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('loading'); }
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: STATE.cart.map(i => ({ id: i.productId, size: i.size, qty: i.qty })),
        lang: STATE.lang,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      showToast('Грешка при плащане. Опитай отново.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = t('cartCheckout'); }
    }
  } catch {
    showToast('Грешка при плащане. Опитай отново.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = t('cartCheckout'); }
  }
}

// ---- Product rendering ----
function productCard(p) {
  const name = STATE.lang === 'bg' ? (p.name_bg || p.name) : (p.name_en || p.name);
  const origin = STATE.lang === 'bg' ? (p.origin_bg || p.origin) : (p.origin_en || p.origin);
  const notes = STATE.lang === 'bg' ? (p.notes_bg || p.flavor_notes_bg || p.notes || '') : (p.notes_en || p.flavor_notes_en || p.notes || '');
  const roast = STATE.lang === 'bg' ? (p.roast_bg || p.roast_level_bg || '') : (p.roast_en || p.roast_level_en || '');
  const method = STATE.lang === 'bg' ? (p.brew_method_bg || '') : (p.brew_method_en || '');
  const price = p.price_250 || p.price || 0;
  const slug = p.slug || p.id;

  return `
    <article class="product-card">
      <a href="/product/${slug}" class="product-card-img">
        ${p.image_url ? `<img src="${p.image_url}" alt="${name}" loading="lazy">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">☕</div>`}
        <div class="product-card-badges">
          ${roast ? `<span class="badge badge-roast">${roast}</span>` : ''}
          ${method ? `<span class="badge badge-method">${method}</span>` : ''}
        </div>
      </a>
      <div class="product-card-body">
        <div class="product-card-origin">${origin || ''}</div>
        <a href="/product/${slug}" class="product-card-name">${name}</a>
        ${notes ? `<p class="product-card-notes">${notes}</p>` : ''}
        <div class="product-card-footer">
          <div class="product-card-price">
            €${Number(price).toFixed(2)}<span class="size-label">/250g</span>
          </div>
          <button class="product-card-add" onclick="event.preventDefault();quickAdd(this,'${p.id}')">
            ${t('addToCart')}
          </button>
        </div>
      </div>
    </article>
  `;
}

function skeletonCard() {
  return `<article class="product-card is-skeleton">
    <div class="product-card-img skeleton"></div>
    <div class="product-card-body">
      <div class="skel-line skeleton" style="width:55%;margin-bottom:8px"></div>
      <div class="skel-title skeleton" style="margin-bottom:8px"></div>
      <div class="skel-line skeleton" style="width:80%;margin-bottom:4px"></div>
      <div class="skel-line skeleton" style="width:65%"></div>
      <div style="margin-top:auto;padding-top:12px;display:flex;justify-content:space-between">
        <div class="skel-price skeleton"></div>
      </div>
    </div>
  </article>`;
}

async function loadProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = Array(3).fill(0).map(skeletonCard).join('');
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    STATE.products = Array.isArray(products) ? products : (products.products || []);
    const featured = STATE.products.filter(p => p.featured).slice(0, 3);
    const display = featured.length ? featured : STATE.products.slice(0, 3);
    grid.innerHTML = display.length ? display.map(productCard).join('') : `<p style="color:var(--text-muted)">${t('noProducts')}</p>`;
    // also populate marquee
    populateMarquee(STATE.products);
  } catch {
    grid.innerHTML = `<p style="color:var(--text-muted)">Продуктите не могат да се заредят в момента.</p>`;
  }
}

function quickAdd(btn, productId) {
  const p = STATE.products.find(x => String(x.id) === String(productId));
  if (!p) return;
  cartAdd(p, '250g', p.price_250 || p.price || 0);
  btn.textContent = t('addedToCart');
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = t('addToCart'); btn.classList.remove('added'); }, 1800);
}

// ---- Marquee ----
function populateMarquee(products) {
  const track = document.getElementById('marquee-track');
  if (!track || !products.length) return;
  const items = products
    .map(p => {
      const origin = STATE.lang === 'bg' ? (p.origin_bg || p.origin || '') : (p.origin_en || p.origin || '');
      return origin ? `<span class="marquee-item"><span>${origin}</span><span class="marquee-dot">·</span></span>` : '';
    })
    .filter(Boolean);
  if (!items.length) return;
  const repeated = [...items, ...items].join('');
  track.innerHTML = repeated;
  track.classList.add('is-ready');
}

// ---- Cart drawer ----
function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Mobile nav ----
function toggleNav() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger');
  nav?.classList.toggle('open');
  btn?.classList.toggle('open');
}

// ---- Language toggle ----
function toggleLang() {
  STATE.lang = STATE.lang === 'bg' ? 'en' : 'bg';
  localStorage.setItem('420b_lang', STATE.lang);
  applyLang();
}
function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  document.querySelectorAll('.lang-toggle').forEach(el => {
    el.textContent = STATE.lang === 'bg' ? 'EN' : 'BG';
  });
  // Re-render products if loaded
  if (STATE.products.length) {
    const grid = document.getElementById('featured-grid');
    if (grid && !grid.querySelector('.is-skeleton')) {
      const featured = STATE.products.filter(p => p.featured).slice(0, 3);
      const display = featured.length ? featured : STATE.products.slice(0, 3);
      grid.innerHTML = display.map(productCard).join('');
    }
    renderCart();
    populateMarquee(STATE.products);
  }
}

// ---- Scroll nav shadow ----
function handleScroll() {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}

// ---- Chat ----
function toggleChat() {
  STATE.chatOpen = !STATE.chatOpen;
  const panel = document.getElementById('chat-panel');
  if (panel) panel.classList.toggle('open', STATE.chatOpen);
  if (STATE.chatOpen && !STATE.chatHistory.length) {
    appendChatMsg(t('chatGreeting'), 'bot');
  }
}
function appendChatMsg(text, role) {
  const el = document.getElementById('chat-messages');
  if (!el) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.textContent = text;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  if (role !== 'typing') STATE.chatHistory.push({ role: role === 'user' ? 'user' : 'model', text });
}
async function sendChat(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const msg = input?.value.trim();
  if (!msg) return;
  input.value = '';
  appendChatMsg(msg, 'user');
  const typing = document.createElement('div');
  typing.className = 'chat-msg typing';
  typing.textContent = '...';
  const el = document.getElementById('chat-messages');
  el?.appendChild(typing);
  el && (el.scrollTop = el.scrollHeight);
  try {
    const history = STATE.chatHistory.slice(-10).map(h => ({ role: h.role, parts: [{ text: h.text }] }));
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history, lang: STATE.lang }),
    });
    const data = await res.json();
    typing.remove();
    appendChatMsg(data.reply || t('chatError'), 'bot');
  } catch {
    typing.remove();
    appendChatMsg(t('chatError'), 'bot');
  }
}

// ---- Toast ----
function showToast(msg, type = 'success') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '⚠'}</span> ${msg}`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCartCount();
  renderCart();
  applyLang();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Cart buttons
  document.querySelectorAll('[data-cart-open]').forEach(el => el.addEventListener('click', openCart));
  document.querySelectorAll('[data-cart-close]').forEach(el => el.addEventListener('click', closeCart));
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Checkout
  document.getElementById('checkout-btn')?.addEventListener('click', startCheckout);

  // Mobile nav
  document.getElementById('hamburger')?.addEventListener('click', toggleNav);

  // Lang
  document.querySelectorAll('.lang-toggle').forEach(el => el.addEventListener('click', toggleLang));

  // Chat
  document.getElementById('chat-fab')?.addEventListener('click', toggleChat);
  document.getElementById('chat-form')?.addEventListener('submit', sendChat);
  document.getElementById('chat-close')?.addEventListener('click', () => {
    STATE.chatOpen = false;
    document.getElementById('chat-panel')?.classList.remove('open');
  });

  // Load products (homepage)
  if (document.getElementById('featured-grid')) loadProducts();

  // Discovery filters
  document.querySelectorAll('.discovery-card').forEach(card => {
    card.addEventListener('click', () => {
      const method = card.dataset.method;
      window.location.href = `/shop?method=${encodeURIComponent(method)}`;
    });
  });
});
