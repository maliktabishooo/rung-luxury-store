// ==================== CONFIGURATION ====================
const ADMIN_EMAIL_1 = "malikkashan530@gmail.com";
const ADMIN_EMAIL_2 = "maliktabish530@gmail.com";
const WHATSAPP_NUMBER = "923335622988";

// Secure admin password (hashed in production)
const ADMIN_PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // "admin" hashed with SHA-256
const ADMIN_PASSWORD_KEY = "rang_admin_logged_in";

// ==================== PRODUCT DATA ====================
let products = JSON.parse(localStorage.getItem('rang_products')) || [
  { 
    id: 1, 
    name: "Designer Luxury Sunglasses", 
    pricePKR: 4500, 
    priceGBP: 18, 
    image: "./glasses.jpg", 
    category: "glasses",
    description: "Premium designer sunglasses with UV protection"
  },
  { 
    id: 2, 
    name: "Premium Chronograph Watch", 
    pricePKR: 12000, 
    priceGBP: 48, 
    image: "./watch.jpg", 
    category: "watches",
    description: "Luxury timepiece with genuine leather strap"
  },
  { 
    id: 3, 
    name: "Designer Hoodie", 
    pricePKR: 8500, 
    priceGBP: 34, 
    image: "./clothes.jpg", 
    category: "clothes",
    description: "Premium designer hoodie for casual wear"
  }
];

let cart = JSON.parse(localStorage.getItem('rang_cart')) || [];
let currency = localStorage.getItem('rang_currency') || "PKR";
let isAdminLoggedIn = localStorage.getItem(ADMIN_PASSWORD_KEY) === "true";

// ==================== DOM ELEMENTS ====================
const productList = document.querySelector(".products-container");
const cartCount = document.getElementById("cart-count");
const cartContainer = document.getElementById("cart-container");
const cartOverlay = document.getElementById("cart-overlay");
const adminPanel = document.getElementById("admin-panel");
const adminLoginModal = document.getElementById("admin-login-modal");
const searchInput = document.getElementById("search-input");
const adminStatus = document.getElementById("admin-status");

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function() {
  // Load theme
  loadTheme();
  
  // Initialize data
  saveProductsToStorage();
  renderProducts();
  setupEventListeners();
  renderAdminProducts();
  updateAdminUI();
  updateCartCount();
  
  // Set currency buttons
  updateCurrencyUI();
  
  // Set initial filter
  document.querySelector(".filter-btn.active")?.click();
});

// ==================== THEME TOGGLE ====================
function loadTheme() {
  const savedTheme = localStorage.getItem('rang_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('rang_theme', newTheme);
  
  // Show notification
  showNotification(`Switched to ${newTheme} mode`, "info");
}

// ==================== PASSWORD UTILITIES ====================
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("admin-password");
  const toggleBtn = document.querySelector(".toggle-password i");
  
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.classList.remove("fa-eye");
    toggleBtn.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleBtn.classList.remove("fa-eye-slash");
    toggleBtn.classList.add("fa-eye");
  }
}

// ==================== STORAGE FUNCTIONS ====================
function saveProductsToStorage() {
  localStorage.setItem('rang_products', JSON.stringify(products));
}

function saveCartToStorage() {
  localStorage.setItem('rang_cart', JSON.stringify(cart));
}

// ==================== PRODUCT RENDERING ====================
function renderProducts(filter = "all") {
  productList.innerHTML = "";
  
  const filteredProducts = filter === "all" 
    ? products 
    : products.filter(product => product.category === filter);
  
  if (filteredProducts.length === 0) {
    productList.innerHTML = `
      <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
        <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
        <p style="font-size: 18px;">No products found in this category</p>
      </div>
    `;
    return;
  }
  
  filteredProducts.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.1}s`;
    card.setAttribute('data-name', product.name.toLowerCase());
    card.setAttribute('data-category', product.category);
    
    const price = currency === "PKR" ? product.pricePKR : product.priceGBP;
    const priceSymbol = currency === "PKR" ? "Rs " : "£";
    
    card.innerHTML = `
      <div class="premium-tag">PREMIUM</div>
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1558769132-cb1a40ed0ada?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
      <h3>${product.name}</h3>
      <div class="product-category">${product.category.toUpperCase()}</div>
      <p>${priceSymbol}${price.toLocaleString()}</p>
      <button onclick="addToCart(${product.id})">
        <i class="fas fa-shopping-bag"></i> Add to Cart
      </button>
    `;
    productList.appendChild(card);
  });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      renderProducts(this.dataset.filter);
    });
  });
  
  // Cart overlay
  cartOverlay.addEventListener("click", toggleCart);
  
  // Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeCart();
      closeAdminPanel();
      closeLoginModal();
      closeOrderConfirmation();
    }
  });
  
  // Checkout form
  document.getElementById("checkout-form").addEventListener("submit", handleCheckout);
  
  // Search
  searchInput.addEventListener("input", function() {
    if (this.value.length > 0) {
      searchProducts(this.value);
    } else {
      hideSearchResults();
    }
  });
  
  // Payment options
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      this.querySelector('input[type="radio"]').checked = true;
    });
  });
  
  // Admin form
  document.getElementById("add-product-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (isAdminLoggedIn) {
      addNewProduct();
    } else {
      showNotification("Please login as admin first!", "error");
      openLoginModal();
    }
  });
  
  // Admin password enter key
  document.getElementById("admin-password")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      adminLogin();
    }
  });
}

// ==================== CART FUNCTIONS ====================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  saveCartToStorage();
  renderCart();
  updateCartCount();
  showNotification("Added to cart!", "success");
  
  // Open cart sidebar
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  renderCart();
  updateCartCount();
  showNotification("Removed from cart", "info");
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCartToStorage();
    renderCart();
    updateCartCount();
  }
}

function clearCart() {
  if (cart.length === 0) return;
  
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCartToStorage();
    renderCart();
    updateCartCount();
    showNotification("Cart cleared", "info");
  }
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartTotal = document.getElementById("cart-total");
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart" style="text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
        <i class="fas fa-shopping-bag" style="font-size: 64px; opacity: 0.3; margin-bottom: 20px;"></i>
        <p style="font-size: 18px; margin-bottom: 10px;">Your cart is empty</p>
        <p style="font-size: 14px;">Add some luxury items to get started!</p>
      </div>
    `;
    cartSubtotal.textContent = currency === "PKR" ? "Rs 0" : "£0";
    cartTotal.textContent = currency === "PKR" ? "Rs 0" : "£0";
    return;
  }
  
  cartItems.innerHTML = "";
  let total = 0;
  
  cart.forEach(item => {
    const price = currency === "PKR" ? item.pricePKR : item.priceGBP;
    const itemTotal = price * item.quantity;
    total += itemTotal;
    
    const priceSymbol = currency === "PKR" ? "Rs " : "£";
    
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div class="price">${priceSymbol}${price.toLocaleString()}</div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
            <i class="fas fa-plus"></i>
          </button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
  
  const priceSymbol = currency === "PKR" ? "Rs " : "£";
  cartSubtotal.textContent = `${priceSymbol}${total.toLocaleString()}`;
  cartTotal.textContent = `${priceSymbol}${total.toLocaleString()}`;
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? "flex" : "none";
}

function toggleCart() {
  cartContainer.classList.toggle("show");
  cartOverlay.classList.toggle("show");
  if (cartContainer.classList.contains("show")) {
    renderCart();
  }
}

function openCart() {
  cartContainer.classList.add("show");
  cartOverlay.classList.add("show");
  renderCart();
}

function closeCart() {
  cartContainer.classList.remove("show");
  cartOverlay.classList.remove("show");
}

// ==================== CURRENCY TOGGLE ====================
function switchCurrency(newCurrency) {
  currency = newCurrency;
  localStorage.setItem('rang_currency', currency);
  updateCurrencyUI();
  renderProducts(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
  renderCart();
  showNotification(`Switched to ${currency}`, "info");
}

function updateCurrencyUI() {
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.currency === currency) {
      btn.classList.add('active');
    }
  });
}

// ==================== SEARCH FUNCTIONS ====================
function searchProducts(query) {
  const searchResults = document.getElementById("search-results");
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );
  
  searchResults.innerHTML = "";
  
  if (filteredProducts.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No products found</div>';
  } else {
    filteredProducts.forEach(product => {
      const price = currency === "PKR" ? product.pricePKR : product.priceGBP;
      const priceSymbol = currency === "PKR" ? "Rs " : "£";
      
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="search-result-info">
          <h4>${product.name}</h4>
          <p>${priceSymbol}${price.toLocaleString()}</p>
        </div>
      `;
      resultItem.addEventListener("click", () => {
        addToCart(product.id);
        hideSearchResults();
        searchInput.value = "";
      });
      searchResults.appendChild(resultItem);
    });
  }
  
  searchResults.classList.add("show");
}

function hideSearchResults() {
  document.getElementById("search-results").classList.remove("show");
}

// ==================== ADMIN FUNCTIONS ====================
function openLoginModal() {
  adminLoginModal.classList.add("show");
  document.getElementById("admin-password").focus();
}

function closeLoginModal() {
  adminLoginModal.classList.remove("show");
  document.getElementById("admin-password").value = "";
}

async function adminLogin() {
  const password = document.getElementById("admin-password").value;
  const hashedInput = await hashPassword(password);
  
  if (hashedInput === ADMIN_PASSWORD_HASH) {
    isAdminLoggedIn = true;
    localStorage.setItem(ADMIN_PASSWORD_KEY, "true");
    updateAdminUI();
    closeLoginModal();
    openAdminPanel();
    showNotification("Admin login successful!", "success");
  } else {
    showNotification("Incorrect password!", "error");
    document.getElementById("admin-password").value = "";
    document.getElementById("admin-password").focus();
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
  updateAdminUI();
  closeAdminPanel();
  showNotification("Logged out successfully", "info");
}

function updateAdminUI() {
  if (isAdminLoggedIn) {
    adminStatus.style.display = "flex";
    document.getElementById("admin-login-btn").innerHTML = '<i class="fas fa-user-shield" style="color: var(--gold-primary);"></i>';
  } else {
    adminStatus.style.display = "none";
    document.getElementById("admin-login-btn").innerHTML = '<i class="fas fa-user-shield"></i>';
  }
}

function openAdminPanel() {
  if (!isAdminLoggedIn) {
    openLoginModal();
    return;
  }
  adminPanel.classList.add("show");
  renderAdminProducts();
  loadOrders();
}

function closeAdminPanel() {
  adminPanel.classList.remove("show");
}

function addNewProduct() {
  const name = document.getElementById("admin-product-name").value;
  const category = document.getElementById("admin-product-category").value;
  const pricePKR = parseFloat(document.getElementById("admin-price-pkr").value);
  const priceGBP = parseFloat(document.getElementById("admin-price-gbp").value);
  const image = document.getElementById("admin-product-image").value;
  const description = document.getElementById("admin-product-description").value;
  
  const newProduct = {
    id: Date.now(),
    name,
    category,
    pricePKR,
    priceGBP,
    image,
    description
  };
  
  products.push(newProduct);
  saveProductsToStorage();
  renderProducts(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
  renderAdminProducts();
  document.getElementById("add-product-form").reset();
  showNotification("Product added successfully!", "success");
}

function removeProduct(productId) {
  if (!isAdminLoggedIn) return;
  
  if (confirm("Are you sure you want to remove this product?")) {
    products = products.filter(p => p.id !== productId);
    saveProductsToStorage();
    renderProducts(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
    renderAdminProducts();
    showNotification("Product removed", "info");
  }
}

function renderAdminProducts() {
  const adminProductsList = document.getElementById("admin-products-list");
  
  if (products.length === 0) {
    adminProductsList.innerHTML = '<p class="no-results">No products added yet</p>';
    return;
  }
  
  adminProductsList.innerHTML = "";
  products.forEach(product => {
    const productItem = document.createElement("div");
    productItem.className = "admin-product-item";
    productItem.innerHTML = `
      <h5>${product.name}</h5>
      <p>${product.category.toUpperCase()} • Rs ${product.pricePKR.toLocaleString()}</p>
      <button class="remove-product-btn" onclick="removeProduct(${product.id})">
        <i class="fas fa-trash"></i> Remove Product
      </button>
    `;
    adminProductsList.appendChild(productItem);
  });
}

// ==================== ORDER MANAGEMENT ====================
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  const ordersList = document.getElementById('orders-list');
  
  ordersList.innerHTML = '';
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="no-results">No orders yet</p>';
    return;
  }
  
  orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  orders.forEach(order => {
    const orderItem = document.createElement('div');
    orderItem.className = 'admin-order-item';
    
    const itemsList = order.items.map(item => 
      `${item.quantity}x ${item.name}`
    ).join(', ');
    
    orderItem.innerHTML = `
      <div class="order-header">
        <strong>Order: ${order.id}</strong>
        <span class="order-date">${new Date(order.timestamp).toLocaleDateString()}</span>
      </div>
      <div class="order-details">
        <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p><strong>Email:</strong> ${order.customer.contact}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Items:</strong> ${itemsList}</p>
        <p><strong>Total:</strong> ${order.currency === 'PKR' ? 'Rs ' : '£'}${order.total.toLocaleString()}</p>
        <p><strong>Status:</strong> 
          <select class="order-status" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </p>
      </div>
      <div class="order-actions">
        <button onclick="viewOrderDetails('${order.id}')" class="order-action-btn">
          <i class="fas fa-eye"></i> View
        </button>
        <button onclick="contactCustomer('${order.customer.phone}')" class="order-action-btn" style="background: #25D366; color: #fff;">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
        <button onclick="deleteOrder('${order.id}')" class="order-action-btn" style="background: #f44336; color: #fff;">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    ordersList.appendChild(orderItem);
  });
}

function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('rang_orders', JSON.stringify(orders));
    showNotification(`Order ${orderId} status updated to ${newStatus}`, "success");
  }
}

function viewOrderDetails(orderId) {
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  const order = orders.find(order => order.id === orderId);
  
  if (order) {
    let itemsDetails = order.items.map(item => 
      `${item.quantity}x ${item.name} - ${order.currency === 'PKR' ? 'Rs ' : '£'}${item.price} each`
    ).join('\n');
    
    const orderDetails = `
Order ID: ${order.id}
Date: ${new Date(order.timestamp).toLocaleString()}
Status: ${order.status}

Customer Details:
Name: ${order.customer.firstName} ${order.customer.lastName}
Phone: ${order.customer.phone}
Email: ${order.customer.contact}
Address: ${order.customer.address}
City: ${order.customer.city} ${order.customer.postal ? `(${order.customer.postal})` : ''}

Order Items:
${itemsDetails}

Total: ${order.currency === 'PKR' ? 'Rs ' : '£'}${order.total}
    `;
    
    alert(orderDetails);
  }
}

function contactCustomer(phoneNumber) {
  const message = encodeURIComponent("Hello from رنگ Luxury Store! Regarding your order...");
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappURL, '_blank', 'noopener,noreferrer');
}

function deleteOrder(orderId) {
  if (!isAdminLoggedIn) {
    showNotification("Please login as admin first!", "error");
    return;
  }
  
  if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
    let orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
    orders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('rang_orders', JSON.stringify(orders));
    loadOrders();
    showNotification(`Order ${orderId} deleted`, "success");
  }
}

// ==================== CHECKOUT FUNCTIONS ====================
async function handleCheckout(e) {
  e.preventDefault();
  
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error");
    return;
  }
  
  if (!document.getElementById("terms").checked) {
    showNotification("Please agree to the Terms & Conditions", "error");
    return;
  }
  
  const selectedPayment = document.querySelector('input[name="payment"]:checked');
  if (!selectedPayment) {
    showNotification("Please select a payment method", "error");
    return;
  }
  
  const orderData = {
    id: "RANG" + Date.now().toString().substr(-8),
    timestamp: new Date().toISOString(),
    status: "pending",
    customer: {
      contact: document.getElementById("contact").value,
      firstName: document.getElementById("first-name").value,
      lastName: document.getElementById("last-name").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      postal: document.getElementById("postal").value,
      phone: document.getElementById("phone").value,
    },
    payment: selectedPayment.value,
    currency: currency,
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: currency === "PKR" ? item.pricePKR : item.priceGBP
    })),
    total: cart.reduce((sum, item) => sum + (currency === "PKR" ? item.pricePKR : item.priceGBP) * item.quantity, 0)
  };
  
  // Save order
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  orders.push(orderData);
  localStorage.setItem('rang_orders', JSON.stringify(orders));
  
  // Send email notifications
  await sendOrderEmails(orderData);
  
  // Show confirmation
  showOrderConfirmation(orderData);
  
  // Reset
  cart = [];
  saveCartToStorage();
  renderCart();
  updateCartCount();
  e.target.reset();
  closeCart();
}

async function sendOrderEmails(orderData) {
  const paymentMethods = {
    'card': 'Credit/Debit Card',
    'cod': 'Cash on Delivery',
    'bank': 'Bank Transfer',
    'jazzcash': 'JazzCash'
  };
  
  const itemsList = orderData.items.map(item => 
    `- ${item.quantity}x ${item.name} (${orderData.currency === 'PKR' ? 'Rs' : '£'}${item.price.toLocaleString()} each)`
  ).join('\n');
  
  const emailSubject = `Order Confirmation - ${orderData.id}`;
  const emailBody = `
Order Confirmation - رنگ Luxury Store

Order ID: ${orderData.id}
Date: ${new Date(orderData.timestamp).toLocaleString()}

Customer Information:
Name: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.contact}
Phone: ${orderData.customer.phone}
Address: ${orderData.customer.address}, ${orderData.customer.city}${orderData.customer.postal ? ' ' + orderData.customer.postal : ''}

Order Details:
${itemsList}

Payment Method: ${paymentMethods[orderData.payment]}
Total: ${orderData.currency === 'PKR' ? 'Rs' : '£'}${orderData.total.toLocaleString()}

Status: ${orderData.status.toUpperCase()}

Thank you for shopping with رنگ Luxury Store!
We will contact you shortly to confirm your order.

Contact us:
Phone: 0333-5622988 / 0334-5422018
WhatsApp: https://wa.me/923335622988
  `;
  
  // Send to customer
  window.open(`mailto:${orderData.customer.contact}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  
  // Send to admins
  setTimeout(() => {
    window.open(`mailto:${ADMIN_EMAIL_1},${ADMIN_EMAIL_2}?subject=${encodeURIComponent('New Order: ' + orderData.id)}&body=${encodeURIComponent(emailBody)}`);
  }, 1000);
}

function showOrderConfirmation(orderData) {
  const modal = document.getElementById("order-confirmation-modal");
  const details = document.getElementById("order-details");
  
  const paymentMethods = {
    'card': 'Credit/Debit Card',
    'cod': 'Cash on Delivery',
    'bank': 'Bank Transfer',
    'jazzcash': 'JazzCash'
  };
  
  details.innerHTML = `
    <strong>Order ID:</strong> ${orderData.id}<br>
    <strong>Total:</strong> ${orderData.currency === 'PKR' ? 'Rs' : '£'}${orderData.total.toLocaleString()}<br>
    <strong>Payment:</strong> ${paymentMethods[orderData.payment]}<br><br>
    Our representative will contact you shortly to confirm your order.
  `;
  
  modal.classList.add("show");
}

function closeOrderConfirmation() {
  document.getElementById("order-confirmation-modal").classList.remove("show");
}

// ==================== WHATSAPP ORDER ====================
function sendOrderViaWhatsApp() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error");
    return;
  }
  
  const itemsList = cart.map(item => {
    const price = currency === "PKR" ? item.pricePKR : item.priceGBP;
    return `${item.quantity}x ${item.name} - ${currency === "PKR" ? "Rs" : "£"}${price.toLocaleString()}`;
  }).join('\n');
  
  const total = cart.reduce((sum, item) => sum + (currency === "PKR" ? item.pricePKR : item.priceGBP) * item.quantity, 0);
  
  const message = `
🛍️ *New Order from رنگ Luxury Store*

*Order Details:*
${itemsList}

*Total:* ${currency === "PKR" ? "Rs" : "£"}${total.toLocaleString()}

*Customer Information:*
Name: ${document.getElementById("first-name")?.value} ${document.getElementById("last-name")?.value}
Phone: ${document.getElementById("phone")?.value}
Email: ${document.getElementById("contact")?.value}
Address: ${document.getElementById("address")?.value}, ${document.getElementById("city")?.value}

I would like to place this order. Thank you!
  `;
  
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank', 'noopener,noreferrer');
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = "success") {
  const notification = document.createElement('div');
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: 'var(--gold-primary)',
  };
  
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    info: 'info-circle'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  `;
  
  notification.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ==================== CSS ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);