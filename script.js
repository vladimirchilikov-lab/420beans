// ===== CONFIG =====
let cart = [];
let lang = 'bg';

const CATALOG = {
  p1: { bg: 'Джима Махоре', price: 28 },
  p2: { bg: 'Уила Ноктюрн', price: 32 },
  p3: { bg: 'Антигуа Здрач', price: 26 },
  m1: { bg: 'Тениска', price: 35 },
  m2: { bg: 'Филтър', price: 18 },
  m3: { bg: 'Листчета', price: 8 },
};

// ===== SHIPPING =====
function calculateShipping(total) {
  return total >= 60 ? 0 : 5;
}

function calculateTotal() {
  let subtotal = cart.reduce((sum, item) => {
    return sum + (CATALOG[item.id].price * item.qty);
  }, 0);

  let shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

// ===== CART =====
function addToCart(id) {
  let item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });

  updateCartUI();
  showToast("Добавено");
}

function updateCartUI() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    body.innerHTML = `<div>Количката е празна</div>`;
    footer.style.display = 'none';
    return;
  }

  let html = '';
  cart.forEach(item => {
    html += `<div>${CATALOG[item.id].bg} x ${item.qty}</div>`;
  });

  const { subtotal, shipping, total } = calculateTotal();

  html += `
    <hr>
    Subtotal: ${subtotal} лв<br>
    Доставка: ${shipping} лв<br>
    <strong>Общо: ${total} лв</strong>
  `;

  body.innerHTML = html;
  footer.style.display = 'block';
}

// ===== CHECKOUT =====
function startCheckout() {
  if (!cart.length) return;

  document.getElementById('cartBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="name" placeholder="Име">
      <input id="phone" placeholder="Телефон">
      <input id="city" placeholder="Град">
      <input id="address" placeholder="Адрес">
      <textarea id="note" placeholder="Бележка"></textarea>

      <button onclick="submitCOD()">Наложен платеж</button>
    </div>
  `;
}

// ===== EMAILJS =====
function submitCOD() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;

  if (!name || !phone) {
    alert("Попълни име и телефон");
    return;
  }

  const { total } = calculateTotal();

  const order = cart.map(i =>
    `${CATALOG[i.id].bg} x ${i.qty}`
  ).join(', ');

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    name,
    phone,
    order,
    total
  }).then(() => {
    cart = [];
    updateCartUI();
    alert("Поръчката е приета!");
  }).catch(() => {
    alert("Грешка");
  });
}

// ===== UI =====
function showToast(msg) {
  console.log(msg);
}
