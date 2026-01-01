// ADMIN CREDENTIALS
const ADMIN_PASSWORD = "admin123";
const ADMIN_PASSWORD_KEY = "rang_admin_logged_in";

// PRODUCTS ARRAY - Load from localStorage or use default
let products = JSON.parse(localStorage.getItem('rang_products')) || [
  { 
    id: 1, 
    name: "Designer Luxury Sunglasses", 
    pricePKR: 45000, 
    priceGBP: 180, 
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "glasses",
    description: "Premium designer sunglasses with UV protection"
  },
  { 
    id: 2, 
    name: "Luxury Chronograph Watch", 
    pricePKR: 120000, 
    priceGBP: 480, 
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "watches",
    description: "Exclusive luxury timepiece with genuine leather strap"
  },
  { 
    id: 3, 
    name: "Designer Formal Suit", 
    pricePKR: 85000, 
    priceGBP: 340, 
    image: "https://images.unsplash.com/photo-1594938372620-c2d36fddbfa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "clothes",
    description: "Premium designer suit for formal occasions"
  },
  { 
    id: 4, 
    name: "Aviator Sunglasses", 
    pricePKR: 32000, 
    priceGBP: 128, 
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "glasses",
    description: "Classic aviator sunglasses with premium lenses"
  },
  { 
    id: 5, 
    name: "Luxury Dress Watch", 
    pricePKR: 95000, 
    priceGBP: 380, 
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "watches",
    description: "Elegant dress watch for formal occasions"
  },
  { 
    id: 6, 
    name: "Designer Leather Jacket", 
    pricePKR: 125000, 
    priceGBP: 500, 
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", 
    category: "clothes",
    description: "Premium designer leather jacket"
  }
];

let cart = JSON.parse(localStorage.getItem('rang_cart')) || [];
let currency = "PKR";
let isAdminLoggedIn = localStorage.getItem(ADMIN_PASSWORD_KEY) === "true";

// DOM Elements
const productList = document.querySelector(".products-container");
const cartCount = document.getElementById("cart-count");
const cartContainer = document.getElementById("cart-container");
const cartOverlay = document.getElementById("cart-overlay");
const adminPanel = document.getElementById("admin-panel");
const adminLoginModal = document.getElementById("admin-login-modal");
const searchInput = document.getElementById("search-input");
const adminStatus = document.getElementById("admin-status");

// WhatsApp Business Number
const WHATSAPP_NUMBER = "923335622988";

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
  saveProductsToStorage();
  renderProducts();
  setupEventListeners();
  renderAdminProducts();
  updateAdminUI();
  
  // Set initial active filter
  document.querySelector(".filter-btn.active").click();
  
  // Load cart count
  updateCartCount();
});

// Save products to localStorage
function saveProductsToStorage() {
  localStorage.setItem('rang_products', JSON.stringify(products));
}

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('rang_cart', JSON.stringify(cart));
}

// Render products with category filtering
function renderProducts(filter = "all") {
  productList.innerHTML = "";
  
  const filteredProducts = filter === "all" 
    ? products 
    : products.filter(product => product.category === filter);
  
  filteredProducts.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 0.1}s`;
    card.setAttribute('data-name', product.name.toLowerCase());
    card.setAttribute('data-category', product.category);
    
    card.innerHTML = `
      <div class="premium-tag">PREMIUM</div>
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1558769132-cb1a40ed0ada?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'">
      <h3>${product.name}</h3>
      <div class="product-category">${product.category.toUpperCase()}</div>
      <p>${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? product.pricePKR.toLocaleString() : product.priceGBP.toFixed(2)}</p>
      <button onclick="addToCart(${product.id})">
        <i class="fas fa-shopping-bag"></i> Add to Cart
      </button>
    `;
    productList.appendChild(card);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      renderProducts(this.dataset.filter);
    });
  });
  
  // Cart toggle
  document.querySelector(".cart-toggle").addEventListener("click", toggleCart);
  cartOverlay.addEventListener("click", toggleCart);
  
  // Close cart with escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      closeCart();
      closeAdminPanel();
      closeLoginModal();
    }
  });
  
  // Checkout form
  document.getElementById("checkout-form").addEventListener("submit", handleCheckout);
  
  // Search input
  searchInput.addEventListener("input", function() {
    if (this.value.length > 0) {
      searchProducts(this.value);
    } else {
      hideSearchResults();
    }
  });
  
  // Search on Enter key
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      searchProducts(this.value);
    }
  });
  
  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });
  
  // Admin form submission
  document.getElementById("add-product-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (isAdminLoggedIn) {
      addNewProduct();
    } else {
      alert("Please login as admin first!");
      openLoginModal();
    }
  });
  
  // Admin password input enter key
  document.getElementById("admin-password")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      adminLogin();
    }
  });
}

// ADMIN FUNCTIONS
function openLoginModal() {
  adminLoginModal.classList.add("show");
  document.getElementById("admin-password").focus();
}

function closeLoginModal() {
  adminLoginModal.classList.remove("show");
  document.getElementById("admin-password").value = "";
}

function adminLogin() {
  const password = document.getElementById("admin-password").value;
  
  if (password === ADMIN_PASSWORD) {
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
  showNotification("Logged out successfully", "success");
}

function updateAdminUI() {
  const adminLoginBtn = document.getElementById("admin-login-btn");
  
  if (isAdminLoggedIn) {
    adminStatus.style.display = "flex";
    adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
    adminLoginBtn.style.color = "#D4AF37";
    adminLoginBtn.onclick = function() { openAdminPanel(); };
  } else {
    adminStatus.style.display = "none";
    adminLoginBtn.innerHTML = '<i class="fas fa-user"></i>';
    adminLoginBtn.style.color = "#ccc";
    adminLoginBtn.onclick = function() { openLoginModal(); };
  }
}

function openAdminPanel() {
  if (!isAdminLoggedIn) {
    openLoginModal();
    return;
  }
  adminPanel.classList.add("show");
  document.body.style.overflow = "hidden";
  loadOrders();
}

function closeAdminPanel() {
  adminPanel.classList.remove("show");
  document.body.style.overflow = "auto";
}

// Search products
function searchProducts(query = null) {
  const searchQuery = query || searchInput.value.toLowerCase().trim();
  
  if (searchQuery.length === 0) {
    hideSearchResults();
    return;
  }
  
  const results = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery) ||
    product.category.toLowerCase().includes(searchQuery) ||
    (product.description && product.description.toLowerCase().includes(searchQuery))
  );
  
  displaySearchResults(results);
}

function displaySearchResults(results) {
  const searchResults = document.getElementById("search-results");
  searchResults.innerHTML = "";
  
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No products found</p>
      </div>
    `;
  } else {
    results.forEach(product => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";
      resultItem.innerHTML = `
        <h4>${product.name}</h4>
        <p>${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? product.pricePKR.toLocaleString() : product.priceGBP.toFixed(2)} • ${product.category.toUpperCase()}</p>
      `;
      resultItem.addEventListener("click", function() {
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

// Cart functions
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  renderCart();
  updateCartCount();
  saveCartToStorage();
  showAddedToCartNotification(product.name);
  openCart();
}

function removeFromCart(index) { 
  cart.splice(index, 1); 
  renderCart();
  updateCartCount();
  saveCartToStorage();
}

function changeQuantity(index, delta) { 
  cart[index].quantity += delta; 
  if (cart[index].quantity < 1) cart[index].quantity = 1; 
  renderCart();
  updateCartCount();
  saveCartToStorage();
}

function toggleCart() {
  cartContainer.classList.toggle("show");
  cartOverlay.classList.toggle("show");
  document.body.style.overflow = cartContainer.classList.contains("show") ? "hidden" : "auto";
}

function openCart() {
  cartContainer.classList.add("show");
  cartOverlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartContainer.classList.remove("show");
  cartOverlay.classList.remove("show");
  document.body.style.overflow = "auto";
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const subtotalPrice = document.getElementById("subtotal-price");
  const totalPrice = document.getElementById("total-price");
  
  cartItems.innerHTML = "";
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-bag"></i>
        <p>Your luxury cart is empty</p>
        <p class="empty-cart-sub">Add exclusive items to begin</p>
      </div>
    `;
    subtotalPrice.innerText = `${currency === "PKR" ? "Rs " : "£"}0.00`;
    totalPrice.innerText = `${currency === "PKR" ? "Rs " : "£"}0.00`;
    return;
  }
  
  let subtotal = 0;
  
  cart.forEach((item, index) => {
    const price = currency === "PKR" ? item.pricePKR : item.priceGBP;
    subtotal += price * item.quantity;
    
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.style.animationDelay = `${index * 0.05}s`;
    
    itemDiv.innerHTML = `
      <img src="${item.image}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1558769132-cb1a40ed0ada?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=60'">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? (price * item.quantity).toLocaleString() : (price * item.quantity).toFixed(2)}</span>
        <div class="quantity-control">
          <button onclick="changeQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${index}, 1)">+</button>
        </div>
      </div>
      <button onclick="removeFromCart(${index})" class="remove-btn">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(itemDiv);
  });
  
  const total = subtotal; // Free shipping, no additional cost
  
  subtotalPrice.innerText = `${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? subtotal.toLocaleString() : subtotal.toFixed(2)}`;
  totalPrice.innerText = `${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? total.toLocaleString() : total.toFixed(2)}`;
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = count;
  cartCount.style.display = count > 0 ? "flex" : "none";
}

function switchCurrency(newCurrency) {
  currency = newCurrency;
  
  // Update active button
  document.querySelectorAll(".currency-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  
  // Update product prices
  const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
  renderProducts(activeFilter);
  
  // Update cart
  renderCart();
  
  // Update search results if visible
  if (document.getElementById("search-results").classList.contains("show")) {
    searchProducts();
  }
}

function showAddedToCartNotification(productName) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${productName} added to cart</span>
  `;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #1a1a1a;
    color: #D4AF37;
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid #D4AF37;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  `;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// WhatsApp Order Function - FIXED VERSION
function sendOrderViaWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some luxury items before checking out.");
    return;
  }
  
  if (!document.getElementById("terms").checked) {
    alert("Please agree to the Terms & Conditions and Privacy Policy to proceed.");
    return;
  }
  
  // Collect form data
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const postal = document.getElementById("postal").value.trim();
  const contact = document.getElementById("contact").value.trim();
  
  // Validate required fields
  if (!firstName || !lastName || !phone || !address || !city) {
    alert("Please fill in all required fields: First Name, Last Name, Phone, Address, and City.");
    return;
  }
  
  // Validate phone number (Pakistani format)
  const phoneRegex = /^03[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/-/g, ''))) {
    alert("Please enter a valid Pakistani phone number (e.g., 03XXXXXXXXX)");
    return;
  }
  
  // Calculate total
  let subtotal = cart.reduce((sum, item) => sum + (currency === "PKR" ? item.pricePKR : item.priceGBP) * item.quantity, 0);
  const total = subtotal; // Free shipping
  
  // Build order items string
  let itemsString = "";
  cart.forEach((item, index) => {
    itemsString += `➤ ${item.quantity}x ${item.name} - ${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? item.pricePKR.toLocaleString() : item.priceGBP.toFixed(2)} each\n`;
  });
  
  // Build WhatsApp message
  const orderId = "RANG" + Date.now().toString().substr(-6);
  const message = `🛍️ *NEW ORDER - رنگ Luxury Store*\n\n` +
                  `*Order ID:* ${orderId}\n` +
                  `*Date:* ${new Date().toLocaleString()}\n\n` +
                  `*👤 Customer Details:*\n` +
                  `Name: ${firstName} ${lastName}\n` +
                  `Phone: ${phone}\n` +
                  `Email/Contact: ${contact || "Not provided"}\n` +
                  `Address: ${address}\n` +
                  `City: ${city}${postal ? ` (${postal})` : ''}\n\n` +
                  `*🛒 Order Items:*\n${itemsString}\n` +
                  `*💰 Order Summary:*\n` +
                  `Subtotal: ${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? subtotal.toLocaleString() : subtotal.toFixed(2)}\n` +
                  `Shipping: FREE (2-4 Days)\n` +
                  `*Total: ${currency === "PKR" ? "Rs " : "£"}${currency === "PKR" ? total.toLocaleString() : total.toFixed(2)}*\n\n` +
                  `*Payment Method:* Customer will confirm via WhatsApp\n` +
                  `*Delivery:* All over Pakistan\n\n` +
                  `_This order was placed via رنگ Luxury Website_`;
  
  // Encode message for URL - PROPERLY encoded
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL - FIXED FORMAT
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  // Save order to localStorage before redirecting
  const orderData = {
    id: orderId,
    timestamp: new Date().toISOString(),
    customer: { firstName, lastName, phone, contact, address, city, postal },
    items: cart.map(item => ({ 
      name: item.name, 
      quantity: item.quantity, 
      price: currency === "PKR" ? item.pricePKR : item.priceGBP 
    })),
    total: total,
    currency: currency,
    status: "pending"
  };
  
  // Save to localStorage
  saveOrderToStorage(orderData);
  
  // Show confirmation before redirecting
  const confirmRedirect = confirm(
    `Your order (${orderId}) is ready to be sent via WhatsApp.\n\n` +
    `Click OK to open WhatsApp and send this order to +${WHATSAPP_NUMBER}.\n\n` +
    `After sending, our team will contact you for payment confirmation.`
  );
  
  if (confirmRedirect) {
    // Clear cart
    cart = [];
    renderCart();
    updateCartCount();
    saveCartToStorage();
    
    // Reset form
    document.getElementById("checkout-form").reset();
    
    // Close cart
    closeCart();
    
    // Open WhatsApp in new tab - THIS IS THE FIX
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    
    // Show thank you message
    setTimeout(() => {
      alert(`Thank you for your order! Order ID: ${orderId}\n\nOur team will contact you within 1 hour to confirm your order.`);
    }, 1000);
  }
}

// Function to save orders to localStorage
function saveOrderToStorage(order) {
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  orders.push(order);
  localStorage.setItem('rang_orders', JSON.stringify(orders));
}

// Admin Panel Functions
function addNewProduct() {
  const name = document.getElementById("admin-product-name").value.trim();
  const category = document.getElementById("admin-product-category").value;
  const pricePKR = parseInt(document.getElementById("admin-price-pkr").value);
  const priceGBP = parseInt(document.getElementById("admin-price-gbp").value);
  const image = document.getElementById("admin-product-image").value.trim();
  const description = document.getElementById("admin-product-description").value.trim();
  
  if (!name || !image || isNaN(pricePKR) || isNaN(priceGBP)) {
    showNotification("Please fill all required fields with valid data!", "error");
    return;
  }
  
  // Generate new ID
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  
  const newProduct = {
    id: newId,
    name,
    pricePKR,
    priceGBP,
    image,
    category,
    description: description || "Premium luxury product"
  };
  
  products.push(newProduct);
  saveProductsToStorage();
  renderAdminProducts();
  
  // Update the main product display
  const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
  renderProducts(activeFilter);
  
  // Reset form
  document.getElementById("add-product-form").reset();
  
  showNotification("Product added successfully!", "success");
}

function removeProduct(id) {
  if (!isAdminLoggedIn) {
    showNotification("Please login as admin first!", "error");
    return;
  }
  
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(product => product.id !== id);
    saveProductsToStorage();
    renderAdminProducts();
    
    // Update the main product display
    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
    renderProducts(activeFilter);
    
    // Also remove from cart if present
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    renderCart();
    updateCartCount();
    
    showNotification("Product removed successfully!", "success");
  }
}

function renderAdminProducts() {
  const adminProductsList = document.getElementById("admin-products-list");
  adminProductsList.innerHTML = "";
  
  if (products.length === 0) {
    adminProductsList.innerHTML = `<p class="no-results">No products added yet</p>`;
    return;
  }
  
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

// Order Management Functions
function loadOrders() {
  const orders = JSON.parse(localStorage.getItem('rang_orders')) || [];
  const ordersList = document.getElementById('orders-list');
  
  ordersList.innerHTML = '';
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="no-results">No orders yet</p>';
    return;
  }
  
  // Sort by date (newest first)
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
        <button onclick="contactCustomer('${order.customer.phone}')" class="order-action-btn" style="background: #25D366;">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
        <button onclick="deleteOrder('${order.id}')" class="order-action-btn" style="background: #f44336;">
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
  // Create proper WhatsApp URL for customer contact
  const message = encodeURIComponent("Hello from رنگ Luxury Store! Regarding your order...");
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
  
  // Open in new tab
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

function handleCheckout(e) {
  e.preventDefault();
  
  if (cart.length === 0) {
    alert("Your cart is empty! Add some luxury items before checking out.");
    return;
  }
  
  if (!document.getElementById("terms").checked) {
    alert("Please agree to the Terms & Conditions and Privacy Policy to proceed.");
    return;
  }
  
  // Get selected payment method
  const selectedPayment = document.querySelector('input[name="payment"]:checked');
  if (!selectedPayment) {
    alert("Please select a payment method.");
    return;
  }
  
  const formData = {
    contact: document.getElementById("contact").value,
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    postal: document.getElementById("postal").value,
    phone: document.getElementById("phone").value,
    shipping: "free",
    payment: selectedPayment.value,
    currency: currency,
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: currency === "PKR" ? item.pricePKR : item.priceGBP
    })),
    total: cart.reduce((sum, item) => sum + (currency === "PKR" ? item.pricePKR : item.priceGBP) * item.quantity, 0)
  };
  
  // Calculate shipping cost (free)
  formData.shippingCost = 0;
  formData.total += formData.shippingCost;
  
  // Show success message
  const orderId = "RANG" + Date.now().toString().substr(-8);
  const paymentMethods = {
    'card': 'Credit/Debit Card',
    'cod': 'Cash on Delivery',
    'bank': 'Bank Transfer',
    'jazzcash': 'JazzCash'
  };
  
  alert(`✅ Order Submitted Successfully!\n\nOrder ID: ${orderId}\nTotal: ${currency === "PKR" ? "Rs " : "£"}${formData.total.toLocaleString()}\nPayment Method: ${paymentMethods[formData.payment]}\n\nOur representative will contact you shortly to confirm your order. Thank you for choosing رنگ!`);
  
  // Reset cart and form
  cart = [];
  renderCart();
  updateCartCount();
  saveCartToStorage();
  e.target.reset();
  closeCart();
}

// Notification function
function showNotification(message, type = "success") {
  const notification = document.createElement('div');
  const bgColor = type === "success" ? "#25D366" : type === "error" ? "#f44336" : "#D4AF37";
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  `;
  
  notification.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}