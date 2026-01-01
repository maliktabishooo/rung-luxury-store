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

// DOM Elements
const productList = document.querySelector(".products-container");
const cartCount = document.getElementById("cart-count");
const cartContainer = document.getElementById("cart-container");
const cartOverlay = document.getElementById("cart-overlay");
const adminPanel = document.getElementById("admin-panel");
const searchInput = document.getElementById("search-input");

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
  saveProductsToStorage();
  renderProducts();
  setupEventListeners();
  renderAdminProducts();
  
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
    addNewProduct();
  });
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
    product.description.toLowerCase().includes(searchQuery)
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

// Admin Panel Functions
function openAdminPanel() {
  adminPanel.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeAdminPanel() {
  adminPanel.classList.remove("show");
  document.body.style.overflow = "auto";
}

function addNewProduct() {
  const name = document.getElementById("admin-product-name").value;
  const category = document.getElementById("admin-product-category").value;
  const pricePKR = parseInt(document.getElementById("admin-price-pkr").value);
  const priceGBP = parseInt(document.getElementById("admin-price-gbp").value);
  const image = document.getElementById("admin-product-image").value;
  const description = document.getElementById("admin-product-description").value;
  
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
  
  showAddedToCartNotification("Product added successfully!");
}

function removeProduct(id) {
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
  
  // In a real application, you would send this data to a server
  console.log("Order submitted:", formData);
  
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