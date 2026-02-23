// App State
let currentScreen = 'home';
let cartItems = [];
let editingItem = null;
let navTimeout = null;
let lastOrder = null;
let currentSmoothie = {
  name: 'Custom Smoothie',
  size: 'Medium',
  price: 5.50,
  ingredients: ['Strawberry', 'Banana'],
  addOns: [],
  image: './img/smoothie.avif'
};

// Checkout state
let checkoutState = {
  pickupTime: 'asap',
  scheduledTime: null,
  pickupName: '',
  paymentMethod: 'credit',
  tipPercentage: 20,
  customTip: 0
};

// Smoothie data
const smoothieData = {
  'Custom Smoothie': {
    image: './img/smoothie.avif',
    defaultIngredients: []
  },
  'Fruit Salad': {
    image: './img/fruit_salad.avif',
    defaultIngredients: []
  },
  'P.B. Banana': {
    image: './img/pb_banana.avif',
    defaultIngredients: ['Banana', 'Peanut Butter']
  },
  'Taro': {
    image: './img/taro.avif',
    defaultIngredients: ['Taro']
  }
};

// DOM Elements
const screens = {
  home: document.getElementById('homeScreen'),
  customize: document.getElementById('customizeScreen'),
  bag: document.getElementById('bagScreen'),
  checkout: document.getElementById('checkoutScreen'),
  confirmation: document.getElementById('confirmationScreen')
};

const bagBtn = document.getElementById('bagBtn');
const backBtn = document.getElementById('backBtn');
const backFromBagBtn = document.getElementById('backFromBagBtn');
const backFromCheckoutBtn = document.getElementById('backFromCheckoutBtn');
const cartBadge = document.getElementById('cartBadge');
const navBtns = document.querySelectorAll('.nav-btn');
const smoothieCards = document.querySelectorAll('.smoothie-card');
const addToBagBtn = document.getElementById('addToBagBtn');
const startShoppingBtn = document.getElementById('startShoppingBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const returnHomeBtn = document.getElementById('returnHomeBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  updateCartBadge();
  injectApplePayModal();
  initializeOrderStatusBanner();
});

// ─── Order Status Banner ─────────────────────────────────────────────────────

function initializeOrderStatusBanner() {
  const banner = document.getElementById('orderStatusBanner');
  if (!banner) return;

  banner.addEventListener('click', () => {
    if (lastOrder) showConfirmationScreen(lastOrder);
  });

  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (lastOrder) showConfirmationScreen(lastOrder);
    }
  });
}

function showOrderStatusBanner(orderData) {
  const banner = document.getElementById('orderStatusBanner');
  const text = document.getElementById('orderStatusText');
  if (!banner || !text) return;

  lastOrder = orderData;
  text.textContent = `Order #${orderData.orderNumber} — picking up at ${orderData.pickupTime}`;
  banner.classList.add('visible');
}

function hideOrderStatusBanner() {
  const banner = document.getElementById('orderStatusBanner');
  if (banner) banner.classList.remove('visible');
  lastOrder = null;
}

function showConfirmationScreen(order) {
  document.getElementById('pickupTime').textContent = order.pickupTime;
  document.getElementById('orderNumber').textContent = order.orderNumber;

  document.getElementById('confirmationOrderItems').innerHTML = order.items.map(item => `
    <div class="order-item">
      <div class="order-item-header">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      <div class="order-item-details">${item.size}, ${item.ingredients.join(', ')}</div>
    </div>
  `).join('');

  document.getElementById('confirmSubtotal').textContent = `$${order.subtotal.toFixed(2)}`;
  document.getElementById('confirmTax').textContent = `$${order.tax.toFixed(2)}`;
  document.getElementById('confirmTip').textContent = `$${order.tip.toFixed(2)}`;
  document.getElementById('confirmTotal').textContent = `$${order.total.toFixed(2)}`;

  navigateTo('confirmation');
}

// ─── Apple Pay Modal ─────────────────────────────────────────────────────────

function injectApplePayModal() {
  const modal = document.createElement('div');
  modal.id = 'applePayOverlay';
  modal.innerHTML = `
    <div id="applePaySheet">
      <div class="ap-topbar"><div class="ap-notch"></div></div>
      <div class="ap-header">
        <div class="ap-logo">
          <svg viewBox="0 0 18 22" fill="none" class="ap-apple-icon">
            <path d="M17.23 18.27C16.89 19.09 16.48 19.84 16 20.52C15.32 21.48 14.77 22.13 14.36 22.46C13.69 23.05 12.97 23.35 12.19 23.36C11.64 23.36 10.97 23.2 10.19 22.87C9.4 22.55 8.68 22.39 8.02 22.39C7.33 22.39 6.59 22.55 5.8 22.87C5.01 23.2 4.37 23.37 3.88 23.38C3.13 23.4 2.4 23.09 1.69 22.46C1.24 22.09 0.66 21.42 0 20.45C-0.71 19.4 -1.28 18.18 -1.72 16.79C-2.19 15.26 -2.43 13.79 -2.43 12.38C-2.43 10.76 -2.11 9.36 -1.47 8.19C-0.97 7.27 -0.29 6.55 0.57 6.02C1.43 5.49 2.38 5.22 3.42 5.21C4 5.21 4.75 5.39 5.67 5.74C6.58 6.09 7.17 6.27 7.43 6.27C7.62 6.27 8.28 6.06 9.39 5.64C10.44 5.25 11.34 5.09 12.08 5.15C14.03 5.3 15.5 6.07 16.47 7.47C14.77 8.54 13.93 10.02 13.95 11.92C13.97 13.42 14.5 14.68 15.54 15.68C16.01 16.15 16.54 16.51 17.14 16.77C17.01 17.15 16.87 17.51 16.72 17.86L17.23 18.27Z" fill="white" transform="translate(0 -3)"/>
          </svg>
          <span>Pay</span>
        </div>
        <div class="ap-merchant">KC's Fresh Fruit & Smoothies</div>
        <div class="ap-amount" id="apAmount">$0.00</div>
      </div>
      <div class="ap-card-section">
        <div class="ap-card">
          <div class="ap-card-top">
            <div class="ap-card-bank">Chase</div>
            <div class="ap-card-chip"></div>
          </div>
          <div class="ap-card-bottom">
            <div class="ap-card-dots">•••• •••• •••• 4242</div>
            <svg class="ap-visa" viewBox="0 0 48 16" fill="none">
              <text x="0" y="14" font-family="Arial" font-size="16" font-weight="bold" fill="white">VISA</text>
            </svg>
          </div>
        </div>
        <div class="ap-card-label">Visa ···· 4242</div>
      </div>
      <div class="ap-faceid-section" id="apFaceIdSection">
        <div class="ap-faceid-ring" id="apFaceIdRing">
          <div class="ap-faceid-icon" id="apFaceIdIcon">
            <svg viewBox="0 0 80 80" fill="none" class="ap-faceid-svg">
              <path d="M10 25 L10 10 L25 10" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M55 10 L70 10 L70 25" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M70 55 L70 70 L55 70" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M25 70 L10 70 L10 55" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="29" cy="34" r="3" fill="white"/>
              <circle cx="51" cy="34" r="3" fill="white"/>
              <path d="M40 38 L37 46 L43 46" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <path d="M32 52 Q40 58 48 52" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
        </div>
        <p class="ap-faceid-label" id="apFaceIdLabel">Double-click to pay</p>
      </div>
      <div class="ap-success-section hidden" id="apSuccessSection">
        <div class="ap-success-ring">
          <svg viewBox="0 0 60 60" fill="none" class="ap-check-svg">
            <circle cx="30" cy="30" r="28" stroke="white" stroke-width="3" fill="none" class="ap-check-circle"/>
            <path d="M16 30 L25 40 L44 20" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="ap-check-path"/>
          </svg>
        </div>
        <p class="ap-success-label">Done</p>
      </div>
      <button class="ap-cancel-btn" id="apCancelBtn">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('apCancelBtn').addEventListener('click', closeApplePaySheet);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeApplePaySheet();
  });
}

function openApplePaySheet() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const tipAmount = checkoutState.customTip || (subtotal * (checkoutState.tipPercentage / 100));
  const total = subtotal + tax + tipAmount;

  document.getElementById('apAmount').textContent = `$${total.toFixed(2)}`;
  document.getElementById('apFaceIdSection').classList.remove('hidden');
  document.getElementById('apSuccessSection').classList.add('hidden');
  document.getElementById('apFaceIdRing').classList.remove('scanning', 'success');
  document.getElementById('apFaceIdLabel').textContent = 'Double-click to pay';
  document.getElementById('apFaceIdIcon').classList.remove('scanning');
  document.getElementById('apCancelBtn').classList.remove('hidden');
  document.getElementById('applePayOverlay').classList.add('active');

  setTimeout(() => simulateFaceIdScan(), 600);
}

function simulateFaceIdScan() {
  const ring = document.getElementById('apFaceIdRing');
  const icon = document.getElementById('apFaceIdIcon');
  const label = document.getElementById('apFaceIdLabel');

  label.textContent = 'Scanning...';
  ring.classList.add('scanning');
  icon.classList.add('scanning');

  setTimeout(() => {
    ring.classList.remove('scanning');
    ring.classList.add('success');
    icon.classList.remove('scanning');

    setTimeout(() => {
      document.getElementById('apFaceIdSection').classList.add('hidden');
      document.getElementById('apCancelBtn').classList.add('hidden');
      document.getElementById('apSuccessSection').classList.remove('hidden');

      const circle = document.querySelector('.ap-check-circle');
      const checkPath = document.querySelector('.ap-check-path');
      circle.style.strokeDasharray = '176';
      circle.style.strokeDashoffset = '176';
      checkPath.style.strokeDasharray = '40';
      checkPath.style.strokeDashoffset = '40';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          circle.style.transition = 'stroke-dashoffset 0.4s ease';
          circle.style.strokeDashoffset = '0';
          setTimeout(() => {
            checkPath.style.transition = 'stroke-dashoffset 0.3s ease';
            checkPath.style.strokeDashoffset = '0';
          }, 200);
        });
      });

      setTimeout(() => {
        closeApplePaySheet();
        setTimeout(() => placeOrder(), 300);
      }, 1400);

    }, 300);
  }, 1800);
}

function closeApplePaySheet() {
  document.getElementById('applePayOverlay').classList.remove('active');
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

function initializeEventListeners() {
  bagBtn.addEventListener('click', () => {
    cancelPendingNavigation();
    navigateTo('bag');
  });

  backBtn.addEventListener('click', () => {
    cancelPendingNavigation();
    navigateTo('home');
  });

  backFromBagBtn.addEventListener('click', () => navigateTo('home'));
  startShoppingBtn.addEventListener('click', () => navigateTo('home'));

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'order') {
        cancelPendingNavigation();
        navigateTo('home');
      }
    });
  });

  smoothieCards.forEach(card => {
    card.addEventListener('click', () => {
      cancelPendingNavigation();
      selectSmoothie(card.dataset.smoothie);
    });
  });

  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSmoothie.size = btn.dataset.size;
      currentSmoothie.price = parseFloat(btn.dataset.price);
      updateAddToBagButton();
    });
  });

  document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => updateIngredients());
  });

  document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateAddOns();
      updateAddToBagButton();
    });
  });

  addToBagBtn.addEventListener('click', () => addToCart());

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      navigateTo('checkout');
      renderCheckoutScreen();
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      if (checkoutState.paymentMethod === 'apple') {
        openApplePaySheet();
      } else {
        placeOrder();
      }
    });
  }

  if (returnHomeBtn) {
    returnHomeBtn.addEventListener('click', () => {
      cartItems = [];
      updateCartBadge();
      navigateTo('home');
    });
  }

  if (backFromCheckoutBtn) {
    backFromCheckoutBtn.addEventListener('click', () => navigateTo('bag'));
  }

  initializeCheckoutListeners();
}

function cancelPendingNavigation() {
  if (navTimeout !== null) {
    clearTimeout(navTimeout);
    navTimeout = null;
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function navigateTo(screen) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screen].classList.add('active');
  currentScreen = screen;

  navBtns.forEach(btn => {
    btn.classList.remove('active');
    if ((screen === 'home' || screen === 'customize') && btn.dataset.tab === 'order') {
      btn.classList.add('active');
    }
  });

  if (screen === 'customize') {
    screens.customize.scrollTop = 0;
  }

  if (screen === 'bag') {
    renderCartItems();
    screens.bag.scrollTop = 0;
  }
}

// ─── Smoothie ────────────────────────────────────────────────────────────────

function selectSmoothie(name) {
  const data = smoothieData[name];
  currentSmoothie = {
    name,
    size: 'Medium',
    price: 5.50,
    ingredients: [...data.defaultIngredients],
    addOns: [],
    image: data.image
  };

  document.getElementById('customizeTitle').textContent = name;
  document.getElementById('customizeImage').src = data.image;

  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.size === 'Medium') btn.classList.add('active');
  });

  document.querySelectorAll('.ingredient-checkbox').forEach(cb => {
    cb.checked = data.defaultIngredients.includes(cb.value);
  });

  document.querySelectorAll('.addon-checkbox').forEach(cb => { cb.checked = false; });

  updateAddToBagButton();
  navigateTo('customize');
}

function updateIngredients() {
  currentSmoothie.ingredients = Array.from(document.querySelectorAll('.ingredient-checkbox:checked')).map(cb => cb.value);
}

function updateAddOns() {
  currentSmoothie.addOns = Array.from(document.querySelectorAll('.addon-checkbox:checked')).map(cb => cb.value);
}

function updateAddToBagButton() {
  const total = currentSmoothie.price + currentSmoothie.addOns.length;
  document.getElementById('addToBagPrice').textContent = `$${total.toFixed(2)}`;
}

function updateCartBadge() {
  const count = cartItems.length;
  cartBadge.textContent = count;
  cartBadge.classList.toggle('hidden', count === 0);
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

function addToCart() {
  const addOnPrice = currentSmoothie.addOns.length * 1.00;
  const totalPrice = currentSmoothie.price + addOnPrice;

  const item = {
    id: Date.now().toString(),
    name: currentSmoothie.name,
    size: currentSmoothie.size,
    price: totalPrice,
    ingredients: [...currentSmoothie.ingredients],
    addOns: [...currentSmoothie.addOns],
    quantity: 1,
    image: currentSmoothie.image
  };

  cartItems.push(item);
  updateCartBadge();
  showToast('Added to Bag', `${item.name} has been added to your bag!`, 'success');

  navTimeout = setTimeout(() => {
    navTimeout = null;
    navigateTo('bag');
  }, 1000);
}

function removeFromCart(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  updateCartBadge();
  renderCartItems();
  showToast('Removed', 'Item removed from your bag', 'success');
}

function updateQuantity(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    renderCartItems();
    setTimeout(() => {
      document.querySelectorAll(".number-button .value").forEach(v => v.classList.add("pop"));
      setTimeout(() => document.querySelectorAll(".number-button .value").forEach(v => v.classList.remove("pop")), 200);
    }, 0);
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItemsContainer');
  const emptyMessage = document.getElementById('emptyCartMessage');
  const summary = document.getElementById('cartSummary');

  if (cartItems.length === 0) {
    container.innerHTML = '';
    emptyMessage.style.display = 'block';
    summary.classList.add('hidden');
    return;
  }

  emptyMessage.style.display = 'none';
  summary.classList.remove('hidden');

  container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-header">
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-size">${item.size}</div>
          </div>
        </div>
        <div class="cart-item-ingredients">${item.ingredients.join(', ')}${item.addOns.length > 0 ? ' + ' + item.addOns.join(', ') : ''}</div>
        <div class="cart-item-footer">
          <div class="number-button" role="group" aria-label="Quantity selector">
            <button class="step-btn minus" aria-label="Decrease quantity" onclick="updateQuantity('${item.id}', -1)">−</button>
            <span class="value" aria-live="polite">${item.quantity}</span>
            <button class="step-btn plus" aria-label="Increase quantity" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="item-actions">
          <button class="item-action-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

function initializeCheckoutListeners() {
  populateTimeOptions();

  document.querySelectorAll('.pickup-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pickup-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      checkoutState.pickupTime = btn.dataset.pickup;
      const dropdown = document.getElementById('timePickerDropdown');
      if (checkoutState.pickupTime === 'scheduled') {
        dropdown.classList.remove('hidden');
      } else {
        dropdown.classList.add('hidden');
        checkoutState.scheduledTime = null;
      }
    });
  });

  const scheduledTimeSelect = document.getElementById('scheduledTime');
  if (scheduledTimeSelect) {
    scheduledTimeSelect.addEventListener('change', (e) => {
      checkoutState.scheduledTime = e.target.value;
    });
  }

  document.querySelectorAll('.payment-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      checkoutState.paymentMethod = btn.dataset.payment;
      document.getElementById('placeOrderBtn').textContent =
        btn.dataset.payment === 'apple' ? 'Pay with Apple Pay' : 'Place Order';
    });
  });

  // Tip buttons with custom input support
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tipValue = btn.dataset.tip;
      const customWrapper = document.getElementById('customTipWrapper');
      const customInput = document.getElementById('customTipInput');

      if (tipValue === 'custom') {
        checkoutState.tipPercentage = 0;
        checkoutState.customTip = parseFloat(customInput.value) || 0;
        customWrapper.classList.add('visible');
        customInput.focus();
      } else {
        checkoutState.tipPercentage = parseInt(tipValue);
        checkoutState.customTip = 0;
        customWrapper.classList.remove('visible');
        if (customInput) customInput.value = '';
      }
      updateCheckoutTotals();
    });
  });

  // Custom tip live update
  const customTipInput = document.getElementById('customTipInput');
  if (customTipInput) {
    customTipInput.addEventListener('input', (e) => {
      checkoutState.customTip = parseFloat(e.target.value) || 0;
      checkoutState.tipPercentage = 0;
      updateCheckoutTotals();
    });
  }

  const pickupNameInput = document.getElementById('pickupName');
  if (pickupNameInput) {
    pickupNameInput.addEventListener('input', (e) => {
      checkoutState.pickupName = e.target.value;
    });
  }
}

function populateTimeOptions() {
  const select = document.getElementById('scheduledTime');
  if (!select) return;

  const now = new Date();
  let startTime = new Date(now);
  startTime.setMinutes(now.getMinutes() + 30);

  const minutes = startTime.getMinutes();
  const roundedMinutes = minutes <= 30 ? 30 : 60;
  startTime.setMinutes(roundedMinutes);
  if (roundedMinutes === 60) {
    startTime.setHours(startTime.getHours() + 1);
    startTime.setMinutes(0);
  }

  const endHour = 17;
  select.innerHTML = '';
  let currentTime = new Date(startTime);

  while (currentTime.getHours() < endHour || (currentTime.getHours() === endHour && currentTime.getMinutes() === 0)) {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dh = h % 12 || 12;
    const dm = m.toString().padStart(2, '0');
    const timeString = `${dh}:${dm} ${ampm}`;
    const option = document.createElement('option');
    option.value = timeString;
    option.textContent = timeString;
    select.appendChild(option);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    if (currentTime.getHours() > endHour) break;
  }

  if (select.options.length > 0) {
    checkoutState.scheduledTime = select.options[0].value;
  }
}

function renderCheckoutScreen() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const tipAmount = checkoutState.customTip || (subtotal * (checkoutState.tipPercentage / 100));
  const totalAmount = subtotal + tax + tipAmount;

  document.getElementById('checkoutOrderItems').innerHTML = cartItems.map(item => `
    <div class="order-item">
      <div class="order-item-header">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      <div class="order-item-details">${item.size}, ${item.ingredients.join(', ')}</div>
    </div>
  `).join('');

  document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('checkoutTax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('checkoutTip').textContent = `$${tipAmount.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${totalAmount.toFixed(2)}`;

  // Reset pickup time
  document.querySelectorAll('.pickup-option').forEach(b => b.classList.remove('active'));
  const asapBtn = document.querySelector('.pickup-option[data-pickup="asap"]');
  if (asapBtn) asapBtn.classList.add('active');
  checkoutState.pickupTime = 'asap';
  document.getElementById('timePickerDropdown').classList.add('hidden');

  // Reset tip to 20% default
  document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
  const defaultTipBtn = document.querySelector('.tip-btn[data-tip="20"]');
  if (defaultTipBtn) defaultTipBtn.classList.add('active');
  checkoutState.tipPercentage = 20;
  checkoutState.customTip = 0;

  // Reset custom tip input
  const customTipWrapper = document.getElementById('customTipWrapper');
  const customTipInput = document.getElementById('customTipInput');
  if (customTipWrapper) customTipWrapper.classList.remove('visible');
  if (customTipInput) customTipInput.value = '';

  // Reset place order button
  document.getElementById('placeOrderBtn').textContent = 'Place Order';
}

function updateCheckoutTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const tipAmount = checkoutState.customTip || (subtotal * (checkoutState.tipPercentage / 100));
  const totalAmount = subtotal + tax + tipAmount;
  document.getElementById('checkoutTip').textContent = `$${tipAmount.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${totalAmount.toFixed(2)}`;
}

// ─── Place Order ──────────────────────────────────────────────────────────────

function placeOrder() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const tipAmount = checkoutState.customTip || (subtotal * (checkoutState.tipPercentage / 100));
  const totalAmount = subtotal + tax + tipAmount;

  let pickupTimeStr;
  if (checkoutState.pickupTime === 'scheduled' && checkoutState.scheduledTime) {
    pickupTimeStr = checkoutState.scheduledTime;
  } else {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    pickupTimeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  const orderNumber = Math.floor(Math.random() * 100) + 1;

  const orderData = {
    orderNumber,
    pickupTime: pickupTimeStr,
    subtotal,
    tax,
    tip: tipAmount,
    total: totalAmount,
    items: cartItems.map(i => ({ ...i }))
  };

  document.getElementById('pickupTime').textContent = pickupTimeStr;
  document.getElementById('orderNumber').textContent = orderNumber;

  document.getElementById('confirmationOrderItems').innerHTML = orderData.items.map(item => `
    <div class="order-item">
      <div class="order-item-header">
        <span>${item.quantity}x ${item.name}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
      <div class="order-item-details">${item.size}, ${item.ingredients.join(', ')}</div>
    </div>
  `).join('');

  document.getElementById('confirmSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('confirmTax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('confirmTip').textContent = `$${tipAmount.toFixed(2)}`;
  document.getElementById('confirmTotal').textContent = `$${totalAmount.toFixed(2)}`;

  showToast('Order Placed', 'Your order has been placed successfully!', 'success');

  setTimeout(() => {
    navigateTo('confirmation');
    setTimeout(() => showOrderStatusBanner(orderData), 400);
  }, 500);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(title, message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;