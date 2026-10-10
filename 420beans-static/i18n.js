/* ═══════════════════════════════════════════════════════
   420 BEANS — i18n.js
   Default site texts (BG/EN) + helpers to apply:
     1) _data/texts.json (base overrides)
     2) admin overrides stored in the database (/api/content)
   Shared by index.html (script.js) and the admin panel.
═══════════════════════════════════════════════════════ */

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
    'chat.title': 'Coffee Advisor',
    'chat.subtitle': 'Ask me anything about coffee',
    'chat.placeholder': 'Ask about a coffee or a brew method…',
    'chat.greeting': "Hey! I'm Bean, your coffee advisor. Tell me how you brew — V60, French press, moka, espresso machine, Aeropress — or what flavours you love, and I'll point you to the right bag and recipe.",
    'chat.error': "Sorry, I couldn't get a response. Please try again in a moment.",
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
    'chat.title': 'Кафе консултант',
    'chat.subtitle': 'Пита ме каквото искаш за кафето',
    'chat.placeholder': 'Питай за кафе или начин на приготвяне…',
    'chat.greeting': 'Здравей! Аз съм Бийн, твоят кафе консултант. Кажи ми как си правиш кафето — V60, френска преса, moka, машина за еспресо, aeropress — или какви вкусове харесваш, и ще ти посоча правилното кафе и рецепта.',
    'chat.error': 'Извинявай, не успях да получа отговор. Опитай отново след малко.',
  },
};

/* Apply the legacy grouped structure from _data/texts.json onto I18N */
function applyTextsJson(tx) {
  if (!tx) return;
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

/* Apply flat admin overrides: { en: { "hero.title": "..." }, bg: { ... } } */
function applyTextOverrides(ov) {
  if (!ov || typeof ov !== 'object') return;
  ['en', 'bg'].forEach(l => {
    const map = ov[l];
    if (!map || typeof map !== 'object') return;
    Object.keys(map).forEach(k => {
      if (typeof map[k] === 'string' && map[k] !== '') I18N[l][k] = map[k];
    });
  });
}
