/* ============================================================
   staff.js — Wiu Kafei staff order board
   ------------------------------------------------------------
   Reads/writes orders through OrdersStore (orders.js) — the
   exact same storage the customer page (script.js) uses. There
   is one order list; this file only renders it differently and
   lets staff advance an order's status.
   ============================================================ */

(function () {
  "use strict";

  const AUTH_KEY = "wiukafei_staff_authed";

  /* ---------------- Auth (simple workshop PIN) ---------------- */
  function isAuthed() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setAuthed(value) {
    try {
      if (value) sessionStorage.setItem(AUTH_KEY, "true");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.warn("sessionStorage unavailable", e);
    }
  }

  function showLogin() {
    document.getElementById("loginScreen").hidden = false;
    document.getElementById("staffBoard").hidden = true;
    document.getElementById("logoutBtn").hidden = true;
    document.getElementById("pinInput").value = "";
    document.getElementById("loginError").hidden = true;
  }

  function showBoard() {
    document.getElementById("loginScreen").hidden = true;
    document.getElementById("staffBoard").hidden = false;
    document.getElementById("logoutBtn").hidden = false;
    renderBoard();
  }

  function handleLogin(e) {
    e.preventDefault();
    const entered = document.getElementById("pinInput").value.trim();
    if (entered === String(BUSINESS.staffPin)) {
      setAuthed(true);
      showBoard();
    } else {
      document.getElementById("loginError").hidden = false;
      document.getElementById("pinInput").value = "";
      document.getElementById("pinInput").focus();
    }
  }

  function handleLogout() {
    setAuthed(false);
    showLogin();
  }

  /* ---------------- Formatting helpers ---------------- */
  function formatPrice(amount) {
    return `${BUSINESS.currency}${amount.toFixed(2)}`;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  /* ---------------- Board rendering ---------------- */
  function renderBoard() {
    const orders = OrdersStore.loadOrders();
    const container = document.getElementById("boardColumns");
    container.innerHTML = "";

    ORDER_STATUSES.forEach((status) => {
      const ordersInStatus = orders
        .filter((o) => o.status === status)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first (FIFO)

      const column = document.createElement("div");
      column.className = "board-column";
      column.innerHTML = `
        <div class="board-column-header">
          <span>${status}</span>
          <span class="board-column-count">${ordersInStatus.length}</span>
        </div>
        <div class="board-column-body"></div>
      `;

      const body = column.querySelector(".board-column-body");
      if (ordersInStatus.length === 0) {
        body.innerHTML = `<div class="board-empty">No orders</div>`;
      } else {
        ordersInStatus.forEach((order) => body.appendChild(renderOrderCard(order)));
      }

      container.appendChild(column);
    });
  }

  function renderOrderCard(order) {
    const card = document.createElement("div");
    card.className = "order-card";

    const itemsHtml = order.items
      .map((it) => `<div class="order-card-line"><span>${escapeHtml(it.name)} x ${it.qty}</span><span>${formatPrice(it.lineTotal)}</span></div>`)
      .join("");

    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const nextStatus = ORDER_STATUSES[currentIndex + 1];

    card.innerHTML = `
      <div class="order-card-top">
        <span class="order-card-number">${escapeHtml(order.orderNumber)}</span>
        <span class="order-card-type">${escapeHtml(order.orderType)}</span>
      </div>
      <div class="order-card-customer">
        <strong>${escapeHtml(order.customerName)}</strong>
        <span>${escapeHtml(order.contactNumber)}</span>
      </div>
      <div class="order-card-items">${itemsHtml}</div>
      <div class="order-card-total-row">
        <span>Total</span>
        <span>${formatPrice(order.total)}</span>
      </div>
      <div class="order-card-meta">
        <span>${escapeHtml(order.paymentMethod)}</span>
        <span>${formatTime(order.createdAt)}</span>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "order-card-actions";
    if (nextStatus) {
      const btn = document.createElement("button");
      btn.className = "btn btn-advance";
      btn.textContent = `Move to ${nextStatus}`;
      btn.addEventListener("click", () => advanceOrder(order.orderNumber, nextStatus));
      actions.appendChild(btn);
    } else {
      const done = document.createElement("span");
      done.className = "order-card-done";
      done.textContent = "✓ Completed";
      actions.appendChild(done);
    }
    card.appendChild(actions);

    return card;
  }

  function advanceOrder(orderNumber, newStatus) {
    OrdersStore.updateOrderStatus(orderNumber, newStatus);
    renderBoard();
  }

  /* ---------------- Init ---------------- */
  function init() {
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);

    // Keep the board in sync if a customer places a new order (or another
    // staff tab changes a status) in a different browser tab.
    OrdersStore.onExternalChange(() => {
      if (isAuthed() && !document.getElementById("staffBoard").hidden) renderBoard();
    });

    if (isAuthed()) {
      showBoard();
    } else {
      showLogin();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
