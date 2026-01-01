const productList = document.getElementById("product-list");

products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>PKR ${product.price}</p>
    <button onclick="addToCart(${product.id})">Add to Cart</button>
  `;

  productList.appendChild(card);
});

function addToCart(id) {
  alert("Product added to cart 🛒");
}