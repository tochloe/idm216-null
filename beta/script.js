// App State
let currentScreen = 'home';
let cartItems = [];
let editingItem = null;
let navTimeout = null;
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
  initializeScrollHandlers();
});

// Only handle customize screen scroll (bag scroll handler removed)
function initializeScrollHandlers() {
  const customizeScreen = document.getElementById('customizeScreen');
  const addToBagBtn = document.getElementById('addToBagBtn');

  customizeScreen.addEventListener('scroll', () => {
    const scrollTop = customizeScreen.scrollTop;
    const scrollHeight = customizeScreen.scrollHeight;
    const clientHeight = customizeScreen.clientHeight;

    if (scrollTop > 200 || (scrollHeight - scrollTop - clientHeight) < 100) {
      addToBagBtn.classList.add('show');
    } else {
      addToBagBtn.classList.remove('show');
    }
  });
}

// Event Listeners
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
      const tab = btn.dataset.tab;
      if (tab === 'order') {
        cancelPendingNavigation();
        navigateTo('home');
      }
    });
  });

  smoothieCards.forEach(card => {
    card.addEventListener('click', () => {
      cancelPendingNavigation();
      const smoothieName = card.dataset.smoothie;
      selectSmoothie(smoothieName);
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
    checkbox.addEventListener('change', () => {
      updateIngredients();
    });
  });

  document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateAddOns();
      updateAddToBagButton();
    });
  });

  addToBagBtn.addEventListener('click', () => {
    addToCart();
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      navigateTo('checkout');
      renderCheckoutScreen();
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      placeOrder();
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
    backFromCheckoutBtn.addEventListener('click', () => {
      navigateTo('bag');
    });
  }

  initializeCheckoutListeners();
}

function cancelPendingNavigation() {
  if (navTimeout !== null) {
    clearTimeout(navTimeout);
    navTimeout = null;
  }
}

// Navigation
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
    addToBagBtn.classList.remove('show');
  }

  if (screen === 'bag') {
    renderCartItems();
    screens.bag.scrollTop = 0;
  }
}

// Smoothie selection
function selectSmoothie(name) {
  const data = smoothieData[name];
  currentSmoothie = {
    name: name,
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

  document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
    checkbox.checked = data.defaultIngredients.includes(checkbox.value);
  });

  document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });

  updateAddToBagButton();
  navigateTo('customize');
}

function updateIngredients() {
  currentSmoothie.ingredients = Array.from(document.querySelectorAll('.ingredient-checkbox:checked'))
    .map(cb => cb.value);
}

function updateAddOns() {
  currentSmoothie.addOns = Array.from(document.querySelectorAll('.addon-checkbox:checked'))
    .map(cb => cb.value);
}

function updateAddToBagButton() {
  const addOnPrice = currentSmoothie.addOns.length * 1.00;
  const totalPrice = currentSmoothie.price + addOnPrice;
  document.getElementById('addToBagPrice').textContent = `$${totalPrice.toFixed(2)}`;
}

function updateCartBadge() {
  const count = cartItems.length;
  cartBadge.textContent = count;
  if (count > 0) {
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }
}

// Cart
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
      const values = document.querySelectorAll(".number-button .value");
      values.forEach(v => v.classList.add("pop"));
      setTimeout(() => values.forEach(v => v.classList.remove("pop")), 200);
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

// Checkout
function initializeCheckoutListeners() {
  populateTimeOptions();

  document.querySelectorAll('.pickup-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pickup-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      checkoutState.pickupTime = btn.dataset.pickup;

      const timePickerDropdown = document.getElementById('timePickerDropdown');
      if (checkoutState.pickupTime === 'scheduled') {
        timePickerDropdown.classList.remove('hidden');
      } else {
        timePickerDropdown.classList.add('hidden');
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
    });
  });

  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tipValue = btn.dataset.tip;
      if (tipValue === 'custom') {
        checkoutState.tipPercentage = 0;
        checkoutState.customTip = 1.00;
      } else {
        checkoutState.tipPercentage = parseInt(tipValue);
        checkoutState.customTip = 0;
      }
      updateCheckoutTotals();
    });
  });

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
    const hours = currentTime.getHours();
    const mins = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = mins.toString().padStart(2, '0');

    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
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

  const orderItemsContainer = document.getElementById('checkoutOrderItems');
  orderItemsContainer.innerHTML = cartItems.map(item => `
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

  // Reset pickup time UI on each checkout visit
  document.querySelectorAll('.pickup-option').forEach(b => b.classList.remove('active'));
  const asapBtn = document.querySelector('.pickup-option[data-pickup="asap"]');
  if (asapBtn) asapBtn.classList.add('active');
  checkoutState.pickupTime = 'asap';
  document.getElementById('timePickerDropdown').classList.add('hidden');
}

function updateCheckoutTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const tipAmount = checkoutState.customTip || (subtotal * (checkoutState.tipPercentage / 100));
  const totalAmount = subtotal + tax + tipAmount;

  document.getElementById('checkoutTip').textContent = `$${tipAmount.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${totalAmount.toFixed(2)}`;
}

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
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    pickupTimeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  document.getElementById('pickupTime').textContent = pickupTimeStr;
  document.getElementById('orderNumber').textContent = Math.floor(Math.random() * 100) + 1;

  const confirmOrderItems = document.getElementById('confirmationOrderItems');
  confirmOrderItems.innerHTML = cartItems.map(item => `
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
  }, 500);
}

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