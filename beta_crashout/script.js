/* =========================================
   GLOBAL STATE (Persisted with localStorage)
========================================= */

let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let activeOrder = JSON.parse(localStorage.getItem("activeOrder")) || null;
let currentSmoothie = JSON.parse(localStorage.getItem("currentSmoothie")) || null;

let checkoutState = JSON.parse(localStorage.getItem("checkoutState")) || {
  pickupTime: "asap",
  scheduledTime: null,
  pickupName: "",
  paymentMethod: "credit",
  tipPercentage: 20,
  customTip: 0
};

function saveState() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  localStorage.setItem("activeOrder", JSON.stringify(activeOrder));
  localStorage.setItem("currentSmoothie", JSON.stringify(currentSmoothie));
  localStorage.setItem("checkoutState", JSON.stringify(checkoutState));
}

/* =========================================
   PAGE DETECTION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  const page = window.location.pathname.split("/").pop();

  switch (page) {
    case "":
    case "index.html":
      initHome();
      break;

    case "customize.html":
      initCustomize();
      break;

    case "bag.html":
      initBag();
      break;

    case "checkout.html":
      initCheckout();
      break;

    case "confirmation.html":
      initConfirmation();
      break;
  }
});


/* =========================================
   HOME
========================================= */

function initHome() {
  const smoothieCards = document.querySelectorAll(".smoothie-card");

  smoothieCards.forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.smoothie;
      if (!name) return;

      selectSmoothie(name);
      window.location.href = "customize.html";
    });
  });

  const bagBtn = document.getElementById("bagBtn");
  if (bagBtn) {
    bagBtn.addEventListener("click", () => {
      window.location.href = "bag.html";
    });
  }
}


/* =========================================
   CUSTOMIZE
========================================= */

function initCustomize() {

  if (!currentSmoothie) {
    window.location.href = "index.html";
    return;
  }

  const title = document.getElementById("customizeTitle");
  const image = document.getElementById("customizeImage");

  if (title) title.textContent = currentSmoothie.name;
  if (image) image.src = currentSmoothie.image;

  document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentSmoothie.size = btn.dataset.size;
      currentSmoothie.price = parseFloat(btn.dataset.price);
      updateAddToBagButton();
      saveState();
    });
  });

  document.querySelectorAll(".ingredient-checkbox").forEach(cb => {
    cb.addEventListener("change", updateIngredients);
  });

  document.querySelectorAll(".addon-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      updateAddOns();
      updateAddToBagButton();
    });
  });

  const addToBagBtn = document.getElementById("addToBagBtn");
  if (addToBagBtn) {
    addToBagBtn.addEventListener("click", addToCart);

    // Animate button in
    setTimeout(() => {
      addToBagBtn.classList.add("show");
    }, 100);
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  updateAddToBagButton();
}

function selectSmoothie(name) {

  const smoothieData = {
    "Custom Smoothie": { image: "./img/smoothie.avif", defaultIngredients: [] },
    "Fruit Salad": { image: "./img/fruit_salad.avif", defaultIngredients: [] },
    "P.B. Banana": { image: "./img/pb_banana.avif", defaultIngredients: ["Banana", "Peanut Butter"] },
    "Taro": { image: "./img/taro.avif", defaultIngredients: ["Taro"] }
  };

  const data = smoothieData[name];
  if (!data) return;

  currentSmoothie = {
    name,
    size: "Medium",
    price: 5.50,
    ingredients: [...data.defaultIngredients],
    addOns: [],
    image: data.image
  };

  saveState();
}

function updateIngredients() {
  currentSmoothie.ingredients = Array.from(
    document.querySelectorAll(".ingredient-checkbox:checked")
  ).map(cb => cb.value);

  saveState();
}

function updateAddOns() {
  currentSmoothie.addOns = Array.from(
    document.querySelectorAll(".addon-checkbox:checked")
  ).map(cb => cb.value);

  saveState();
}

function updateAddToBagButton() {
  const priceSpan = document.getElementById("addToBagPrice");
  if (!priceSpan || !currentSmoothie) return;

  const addOnPrice = currentSmoothie.addOns.length * 1;
  const total = currentSmoothie.price + addOnPrice;

  priceSpan.textContent = `$${total.toFixed(2)}`;
}


/* =========================================
   BAG
========================================= */

function initBag() {

  renderCartItems();

  const summary = document.getElementById("cartSummary");
  if (summary && cartItems.length > 0) {
    setTimeout(() => summary.classList.add("show"), 100);
  }

  const backBtn = document.getElementById("backFromBagBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }
}

function addToCart() {

  if (!currentSmoothie) return;

  const addOnPrice = currentSmoothie.addOns.length * 1;
  const total = currentSmoothie.price + addOnPrice;

  const item = {
    id: Date.now().toString(),
    ...currentSmoothie,
    price: total,
    quantity: 1
  };

  cartItems.push(item);
  saveState();
  updateCartBadge();

  showToast("Added to Bag", `${item.name} added!`);

  setTimeout(() => {
    window.location.href = "bag.html";
  }, 600);
}

function renderCartItems() {

  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Your bag is empty</p>
        <button onclick="window.location.href='index.html'" class="secondary-btn">
          Browse Smoothies
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img src="${item.image}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">${item.size}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    </div>
  `).join("");
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  badge.textContent = cartItems.length;
  badge.classList.toggle("hidden", cartItems.length === 0);
}


/* =========================================
   CHECKOUT
========================================= */

function initCheckout() {

  if (cartItems.length === 0) {
    window.location.href = "index.html";
    return;
  }

  renderCheckoutScreen();

  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
  }

  const backBtn = document.getElementById("backFromCheckoutBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "bag.html";
    });
  }
}

function renderCheckoutScreen() {

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const subEl = document.getElementById("checkoutSubtotal");
  const taxEl = document.getElementById("checkoutTax");
  const totalEl = document.getElementById("checkoutTotal");

  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}


/* =========================================
   CONFIRMATION
========================================= */

function initConfirmation() {

  const returnBtn = document.getElementById("returnHomeBtn");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      cartItems = [];
      currentSmoothie = null;
      saveState();
      window.location.href = "index.html";
    });
  }
}

function placeOrder() {
  activeOrder = {
    orderNumber: Math.floor(Math.random() * 1000),
    items: [...cartItems]
  };

  saveState();
  window.location.href = "confirmation.html";
}


/* =========================================
   TOAST
========================================= */

function showToast(title, message) {

  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast success";
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
