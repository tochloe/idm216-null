// App State
let currentScreen = 'home';
let cartItems = [];
let editingItem = null;
let currentSmoothie = {
  name: 'Custom Smoothie',
  size: 'Medium',
  price: 5.50,
  ingredients: ['Strawberry', 'Banana'],
  addOns: [],
  image: './img/smoothie.avif'
};

// Smoothie data
const smoothieData = {
  'Custom Smoothie': {
    image: './img/smoothie.avif',
    defaultIngredients: ['Strawberry', 'Banana']
  },
  'Fruit Salad': {
    image: './img/fruit_salad.avif',
    defaultIngredients: ['Strawberry', 'Banana', 'Mango', 'Blueberry']
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
  bag: document.getElementById('bagScreen')
};

const bagBtn = document.getElementById('bagBtn');
const backBtn = document.getElementById('backBtn');
const backFromBagBtn = document.getElementById('backFromBagBtn');
const cartBadge = document.getElementById('cartBadge');
const navBtns = document.querySelectorAll('.nav-btn');
const smoothieCards = document.querySelectorAll('.smoothie-card');
const addToBagBtn = document.getElementById('addToBagBtn');
const startShoppingBtn = document.getElementById('startShoppingBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  updateCartBadge();
});

// Event Listeners
function initializeEventListeners() {
  // Navigation
  bagBtn.addEventListener('click', () => navigateTo('bag'));
  backBtn.addEventListener('click', () => navigateTo('home'));
  backFromBagBtn.addEventListener('click', () => navigateTo('home'));
  startShoppingBtn.addEventListener('click', () => navigateTo('home'));
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === 'order') {
        navigateTo('home');
      }
    });
  });

  // Smoothie selection
  smoothieCards.forEach(card => {
    card.addEventListener('click', () => {
      const smoothieName = card.dataset.smoothie;
      selectSmoothie(smoothieName);
    });
  });

  // Size selection
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSmoothie.size = btn.dataset.size;
      currentSmoothie.price = parseFloat(btn.dataset.price);
      updateAddToBagButton();
    });
  });

  // Ingredient checkboxes
  document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateIngredients();
    });
  });

  // Add-on checkboxes
  document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateAddOns();
      updateAddToBagButton();
    });
  });

  // Add to bag
  addToBagBtn.addEventListener('click', () => {
    addToCart();
  });

  // Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      showToast('Success', 'Proceeding to checkout...', 'success');
    });
  }
}

// Navigation
function navigateTo(screen) {
  // Remove active class from all screens
  Object.values(screens).forEach(s => s.classList.remove('active'));
  
  // Add active class to target screen
  screens[screen].classList.add('active');
  currentScreen = screen;

  // Update nav buttons
  navBtns.forEach(btn => {
    btn.classList.remove('active');
    if ((screen === 'home' || screen === 'customize') && btn.dataset.tab === 'order') {
      btn.classList.add('active');
    }
  });

  // Update bag screen when navigating to it
  if (screen === 'bag') {
    renderCartItems();
  }
}

// smoothie selection
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

  // update customizations
  document.getElementById('customizeTitle').textContent = name;
  document.getElementById('customizeImage').src = data.image;

  // changing sizes
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.size === 'Medium') {
      btn.classList.add('active');
    }
  });

  // Reset checkboxes
  document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
    checkbox.checked = data.defaultIngredients.includes(checkbox.value);
  });

  document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });

  updateAddToBagButton();
  navigateTo('customize');
}

// update functions
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

// cart functions
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
  
  setTimeout(() => {
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

    // animate value
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
  <button 
    class="step-btn minus" 
    aria-label="Decrease quantity"
    onclick="updateQuantity('${item.id}', -1)"
  >−</button>

  <span class="value" aria-live="polite">
    ${item.quantity}
  </span>

  <button 
    class="step-btn plus" 
    aria-label="Increase quantity"
    onclick="updateQuantity('${item.id}', 1)"
  >+</button>
</div>

          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="item-actions">
          <button class="item-action-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // updating total
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
}

// pop-ups
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
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Make functions available globally
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
