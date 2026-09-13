/* ============================================================
   content.js — Wiu Kafei business & product content
   ------------------------------------------------------------
   EDIT THIS FILE to update business info, categories, products,
   prices, descriptions, and image paths. Nothing in script.js
   or index.html needs to change when you edit this file.

   To replace a placeholder image: put your real photo in
   images/products/ and update the matching "image" path below.
   ============================================================ */

const BUSINESS = {
  name: "Wiu Kafei",
  tagline: "Ready-to-drink bottled coffee, made fresh daily",
  currency: "RM",
  logoText: "Wiu Kafei",
  heroHeading: "Bottled Coffee, Made Fresh",
  heroSub: "Order your favourite Wiu Kafei blend for delivery or self-pickup.",
  location: "Ipoh, Malaysia", // TODO: replace with your real address / service area
  hours: "9:00 AM – 6:00 PM, Daily",
  orderTypes: ["Delivery", "Self-Pickup"],
  paymentMethods: ["Cash on Delivery / Pickup", "Bank Transfer", "DuitNow / QR"],
  orderNumberPrefix: "#",
  orderNumberPadding: 3, // #001, #002, ...
  staffPin: "1234", // workshop/demo PIN for staff.html — change this to whatever you like
};

const CATEGORIES = [
  { id: "signature-black", name: "Signature Black" },
  { id: "milk-based", name: "Milk-Based" },
  { id: "specialty", name: "Specialty & Flavoured" },
];

const PRODUCTS = [
  // --- Signature Black ---
  {
    id: "original-black",
    categoryId: "signature-black",
    name: "Wiu Original Black",
    description: "Classic single-origin black coffee, bold and unsweetened.",
    price: 6.00,
    image: "images/products/original-black.svg",
  },
  {
    id: "long-black",
    categoryId: "signature-black",
    name: "Wiu Long Black",
    description: "Extra bold double-shot black coffee for a strong pick-me-up.",
    price: 7.00,
    image: "images/products/long-black.svg",
  },
  {
    id: "espresso-shot",
    categoryId: "signature-black",
    name: "Wiu Espresso Shot",
    description: "Concentrated espresso in a bottle, no sugar added.",
    price: 6.50,
    image: "images/products/espresso-shot.svg",
  },

  // --- Milk-Based ---
  {
    id: "creamy-latte",
    categoryId: "milk-based",
    name: "Wiu Creamy Latte",
    description: "Smooth espresso blended with fresh milk for a mellow sip.",
    price: 7.50,
    image: "images/products/creamy-latte.svg",
  },
  {
    id: "classic-white",
    categoryId: "milk-based",
    name: "Wiu Classic White",
    description: "Traditional milk coffee, lightly sweetened.",
    price: 7.00,
    image: "images/products/classic-white.svg",
  },
  {
    id: "mocha-delight",
    categoryId: "milk-based",
    name: "Wiu Mocha Delight",
    description: "Rich chocolate-infused milk coffee, a café favourite.",
    price: 8.00,
    image: "images/products/mocha-delight.svg",
  },

  // --- Specialty & Flavoured ---
  {
    id: "hazelnut-dream",
    categoryId: "specialty",
    name: "Wiu Hazelnut Dream",
    description: "Roasted hazelnut flavoured coffee with a nutty finish.",
    price: 8.50,
    image: "images/products/hazelnut-dream.svg",
  },
  {
    id: "caramel-swirl",
    categoryId: "specialty",
    name: "Wiu Caramel Swirl",
    description: "Salted caramel bottled coffee, sweet with a hint of salt.",
    price: 8.50,
    image: "images/products/caramel-swirl.svg",
  },
  {
    id: "vanilla-cold-brew",
    categoryId: "specialty",
    name: "Wiu Vanilla Cold Brew",
    description: "Slow-steeped cold brew rounded out with real vanilla.",
    price: 9.00,
    image: "images/products/vanilla-cold-brew.svg",
  },
];

const ORDER_STATUSES = ["NEW", "PREPARING", "READY", "COMPLETED"];

const ORDER_STATUS_LABELS = {
  NEW: "Order received — waiting to be prepared",
  PREPARING: "Your order is being prepared",
  READY: "Ready for pickup / out for delivery",
  COMPLETED: "Order completed — enjoy your coffee!",
};
