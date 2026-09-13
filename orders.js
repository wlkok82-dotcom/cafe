/* ============================================================
   orders.js — shared order & cart data layer
   ------------------------------------------------------------
   Used by BOTH index.html (customer page) and staff.html
   (staff page). This is the single source of truth for cart
   and order storage, so the two pages can never drift out of
   sync with each other — they read and write the exact same
   functions, not two separate copies of the same logic.

   Storage is localStorage for now (an MVP, no backend yet).
   If you later add a real backend/database, this is the only
   file that needs to change — index.html, staff.html, script.js
   and staff.js all just call OrdersStore.* and don't care how
   or where the data actually lives.

   Load this file AFTER content.js (needs BUSINESS/ORDER_STATUSES)
   and BEFORE script.js / staff.js.
   ============================================================ */

const OrdersStore = (function () {
  const STORAGE_KEYS = {
    cart: "wiukafei_cart",
    orders: "wiukafei_orders",
    orderSeq: "wiukafei_order_seq",
  };

  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("localStorage read failed for", key, e);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed for", key, e);
    }
  }

  function loadCart() {
    return safeGet(STORAGE_KEYS.cart, []);
  }

  function saveCart(cart) {
    safeSet(STORAGE_KEYS.cart, cart);
  }

  function loadOrders() {
    return safeGet(STORAGE_KEYS.orders, []);
  }

  function saveOrders(orders) {
    safeSet(STORAGE_KEYS.orders, orders);
  }

  function nextOrderNumber() {
    const seq = safeGet(STORAGE_KEYS.orderSeq, 0) + 1;
    safeSet(STORAGE_KEYS.orderSeq, seq);
    const padded = String(seq).padStart((BUSINESS && BUSINESS.orderNumberPadding) || 3, "0");
    return `${(BUSINESS && BUSINESS.orderNumberPrefix) || "#"}${padded}`;
  }

  function addOrder(order) {
    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);
    return order;
  }

  function findOrder(orderNumber) {
    const orders = loadOrders();
    return orders.find(
      (o) => o.orderNumber.toLowerCase() === String(orderNumber).toLowerCase()
    );
  }

  // Returns the updated order, or null if not found.
  function updateOrderStatus(orderNumber, newStatus) {
    const orders = loadOrders();
    const order = orders.find(
      (o) => o.orderNumber.toLowerCase() === String(orderNumber).toLowerCase()
    );
    if (!order) return null;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    saveOrders(orders);
    return order;
  }

  // Subscribe to changes made in OTHER browser tabs/windows (e.g. staff
  // updates a status while the customer's tracking tab is still open).
  // Same-tab changes should just re-render directly after each write.
  function onExternalChange(callback) {
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.orders) callback();
    });
  }

  return {
    STORAGE_KEYS,
    loadCart,
    saveCart,
    loadOrders,
    saveOrders,
    nextOrderNumber,
    addOrder,
    findOrder,
    updateOrderStatus,
    onExternalChange,
  };
})();
