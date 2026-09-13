/* ============================================================
   script.js — Wiu Kafei customer ordering logic
   ------------------------------------------------------------
   Reads business/product data from content.js, and cart/order
   storage from orders.js (both loaded first — see index.html).
   Handles: browse -> cart -> checkout -> place order -> track.

   Orders are written via OrdersStore (orders.js) so the staff
   page (staff.html / staff.js) reads and updates the exact same
   data — there is only one order list, not two.
   ============================================================ */

(function () {
  "use strict";

  let state = {
    cart: OrdersStore.loadCart(), // [{ productId, qty }]
    activeCategory: "all",
    lastTrackedQuery: "",
  };

  function saveCart() {
    OrdersStore.saveCart(state.cart);
  }

  /* ---------------- Product lookup ---------------- */
  function getProduct(productId) {
    return PRODUCTS.find((p) => p.id === productId);
  }

  function formatPrice(amount) {
    return `${BUSINESS.currency}${amount.toFixed(2)}`;
  }

  function cartLineTotal(line) {
    const product = getProduct(line.productId);
    return product ? product.price * line.qty : 0;
  }

  function cartTotal() {
    return state.cart.reduce((sum, line) => sum + cartLineTotal(line), 0);
  }

  function cartCount() {
    return state.cart.reduce((sum, line) => sum + line.qty, 0);
  }

  /* ---------------- Rendering: static business text ---------------- */
  function renderBusinessInfo() {
    document.title = `${BUSINESS.name} — Order Online`;
    setText("logoText", BUSINESS.logoText || BUSINESS.name);
    setText("heroHeading", BUSINESS.heroHeading);
    setText("heroSub", BUSINESS.heroSub);
    setText("footerBusinessName", BUSINESS.name);
    setText("footerHours", `Hours: ${BUSINESS.hours}`);
    setText("footerLocation", BUSINESS.location);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text != null) el.textContent = text;
  }

  /* ---------------- Rendering: categories ---------------- */
  function renderCategoryTabs() {
    const container = document.getElementById("categoryTabs");
    container.innerHTML = "";

    const allTab = makeCategoryTab("all", "All");
    container.appendChild(allTab);

    CATEGORIES.forEach((cat) => {
      container.appendChild(makeCategoryTab(cat.id, cat.name));
    });
  }

  function makeCategoryTab(id, label) {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (state.activeCategory === id ? " active" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => {
      state.activeCategory = id;
      renderCategoryTabs();
      renderProducts();
    });
    return btn;
  }

  /* ---------------- Rendering: products ---------------- */
  function renderProducts() {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    const categoriesToShow =
      state.activeCategory === "all"
        ? CATEGORIES
        : CATEGORIES.filter((c) => c.id === state.activeCategory);

    categoriesToShow.forEach((cat) => {
      const productsInCat = PRODUCTS.filter((p) => p.categoryId === cat.id);
      if (productsInCat.length === 0) return;

      if (state.activeCategory === "all") {
        const heading = document.createElement("div");
        heading.className = "category-heading";
        heading.textContent = cat.name;
        grid.appendChild(heading);
      }

      productsInCat.forEach((product) => {
        grid.appendChild(renderProductCard(product));
      });
    });
  }

  function renderProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img class="product-image" src="${product.image}" alt="${product.name}"
           onerror="this.onerror=null;this.src='';this.style.display='flex';this.style.alignItems='center';this.style.justifyContent='center';this.textContent='☕';this.style.fontSize='2rem';" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="btn-add" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
    card.querySelector(".btn-add").addEventListener("click", () => addToCart(product.id));
    return card;
  }

  /* ---------------- Cart actions ---------------- */
  function addToCart(productId) {
    const existing = state.cart.find((line) => line.productId === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ productId, qty: 1 });
    }
    saveCart();
    updateCartUI();

    const product = getProduct(productId);
    showToast(`${product ? product.name : "Item"} added to cart`);
  }

  /* ---------------- Toast notification ---------------- */
  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById("addToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "addToast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 1600);
  }

  function changeQty(productId, delta) {
    const line = state.cart.find((l) => l.productId === productId);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      state.cart = state.cart.filter((l) => l.productId !== productId);
    }
    saveCart();
    updateCartUI();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter((l) => l.productId !== productId);
    saveCart();
    updateCartUI();
  }

  /* ---------------- Rendering: cart ---------------- */
  function updateCartUI() {
    document.getElementById("cartCount").textContent = cartCount();
    document.getElementById("cartTotal").textContent = formatPrice(cartTotal());

    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.disabled = state.cart.length === 0;

    const cartItemsEl = document.getElementById("cartItems");
    cartItemsEl.innerHTML = "";

    if (state.cart.length === 0) {
      cartItemsEl.innerHTML = `<div class="empty-cart">Your cart is empty. Add something delicious! ☕</div>`;
      return;
    }

    state.cart.forEach((line) => {
      const product = getProduct(line.productId);
      if (!product) return;
      const item = document.createElement("div");
      item.className = "cart-item";
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.style.visibility='hidden'" />
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <div class="cart-item-price">${formatPrice(product.price)} x ${line.qty} = ${formatPrice(product.price * line.qty)}</div>
          <button class="remove-btn" data-id="${product.id}">Remove</button>
        </div>
        <div class="qty-stepper">
          <button class="qty-minus" data-id="${product.id}">−</button>
          <span>${line.qty}</span>
          <button class="qty-plus" data-id="${product.id}">+</button>
        </div>
      `;
      item.querySelector(".qty-minus").addEventListener("click", () => changeQty(product.id, -1));
      item.querySelector(".qty-plus").addEventListener("click", () => changeQty(product.id, 1));
      item.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(product.id));
      cartItemsEl.appendChild(item);
    });
  }

  /* ---------------- Cart drawer open/close ---------------- */
  function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").classList.add("visible");
  }

  function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("visible");
  }

  /* ---------------- Checkout ---------------- */
  function populateSelect(id, options) {
    const select = document.getElementById(id);
    select.innerHTML = options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
  }

  function renderCheckoutSummary() {
    const summaryItems = document.getElementById("summaryItems");
    summaryItems.innerHTML = state.cart
      .map((line) => {
        const product = getProduct(line.productId);
        if (!product) return "";
        return `<div class="summary-line"><span>${product.name} x ${line.qty}</span><span>${formatPrice(product.price * line.qty)}</span></div>`;
      })
      .join("");
    document.getElementById("summaryTotal").textContent = formatPrice(cartTotal());
  }

  function openCheckout() {
    if (state.cart.length === 0) return;
    renderCheckoutSummary();
    closeCart();
    document.getElementById("checkoutModal").classList.add("open");
    document.getElementById("checkoutOverlay").classList.add("visible");
  }

  function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("open");
    document.getElementById("checkoutOverlay").classList.remove("visible");
  }

  function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById("custName").value.trim();
    const contact = document.getElementById("custContact").value.trim();
    const orderType = document.getElementById("orderType").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!name || !contact) return; // native required validation also covers this

    const items = state.cart.map((line) => {
      const product = getProduct(line.productId);
      return {
        productId: line.productId,
        name: product.name,
        price: product.price,
        qty: line.qty,
        lineTotal: product.price * line.qty,
      };
    });

    const order = {
      orderNumber: OrdersStore.nextOrderNumber(),
      customerName: name,
      contactNumber: contact,
      orderType,
      paymentMethod,
      items,
      total: cartTotal(),
      status: "NEW", // ORDER_STATUSES[0] — new orders always start here
      createdAt: new Date().toISOString(),
    };

    OrdersStore.addOrder(order);

    // clear cart
    state.cart = [];
    saveCart();
    updateCartUI();

    closeCheckout();
    document.getElementById("checkoutForm").reset();
    openConfirm(order);
  }

  function openConfirm(order) {
    document.getElementById("confirmName").textContent = order.customerName;
    document.getElementById("confirmOrderNumber").textContent = order.orderNumber;
    document.getElementById("confirmModal").classList.add("open");
    document.getElementById("confirmOverlay").classList.add("visible");
  }

  function closeConfirm() {
    document.getElementById("confirmModal").classList.remove("open");
    document.getElementById("confirmOverlay").classList.remove("visible");
  }

  /* ---------------- Order tracking ---------------- */
  function trackOrder() {
    const input = document.getElementById("trackingInput");
    const resultEl = document.getElementById("trackingResult");
    let query = input.value.trim();
    if (!query) {
      resultEl.innerHTML = `<p class="tracking-error">Please enter an order number.</p>`;
      return;
    }
    if (!query.startsWith(BUSINESS.orderNumberPrefix || "#")) {
      query = (BUSINESS.orderNumberPrefix || "#") + query;
    }

    state.lastTrackedQuery = query;
    const order = OrdersStore.findOrder(query);

    if (!order) {
      resultEl.innerHTML = `<p class="tracking-error">No order found for ${escapeHtml(query)}. Please check the number and try again.</p>`;
      return;
    }

    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const stepsHtml = ORDER_STATUSES.map((status, i) => {
      const done = i <= currentIndex;
      return `<div class="status-step${done ? " done" : ""}">${status}</div>`;
    }).join("");

    const itemsHtml = order.items
      .map((it) => `<div class="summary-line"><span>${it.name} x ${it.qty}</span><span>${formatPrice(it.lineTotal)}</span></div>`)
      .join("");

    resultEl.innerHTML = `
      <div class="tracking-card">
        <h3>Order ${order.orderNumber}</h3>
        <p>${ORDER_STATUS_LABELS[order.status] || order.status}</p>
        <div class="status-steps">${stepsHtml}</div>
        <div class="order-summary" style="margin-top:16px;">
          <h3>Items</h3>
          ${itemsHtml}
          <div class="summary-total-row"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        </div>
        <p style="margin-top:12px; font-size:0.85rem; color: var(--text-muted);">
          ${order.orderType} · ${order.paymentMethod}
        </p>
      </div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- Live status refresh ---------------- */
  // If staff updates this order's status in another tab while the
  // customer is looking at the tracking result, refresh it automatically.
  function handleExternalOrderChange() {
    if (state.lastTrackedQuery) trackOrder();
  }

  /* ---------------- Nav scroll ---------------- */
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------- Init ---------------- */
  function init() {
    renderBusinessInfo();
    renderCategoryTabs();
    renderProducts();
    updateCartUI();

    populateSelect("orderType", BUSINESS.orderTypes);
    populateSelect("paymentMethod", BUSINESS.paymentMethods);

    document.getElementById("openCartBtn").addEventListener("click", openCart);
    document.getElementById("closeCartBtn").addEventListener("click", closeCart);
    document.getElementById("cartOverlay").addEventListener("click", closeCart);

    document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
    document.getElementById("closeCheckoutBtn").addEventListener("click", closeCheckout);
    document.getElementById("checkoutOverlay").addEventListener("click", closeCheckout);
    document.getElementById("checkoutForm").addEventListener("submit", placeOrder);

    document.getElementById("confirmCloseBtn").addEventListener("click", closeConfirm);
    document.getElementById("confirmOverlay").addEventListener("click", closeConfirm);

    document.getElementById("trackBtn").addEventListener("click", trackOrder);
    document.getElementById("trackingInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") trackOrder();
    });

    document.querySelectorAll(".nav-link").forEach((btn) => {
      btn.addEventListener("click", () => scrollToSection(btn.dataset.scroll));
    });

    OrdersStore.onExternalChange(handleExternalOrderChange);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
