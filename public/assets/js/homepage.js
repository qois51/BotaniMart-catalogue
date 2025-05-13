async function fetchAndRenderProducts() {
  try {
    // Fetch data from the API
    const response = await fetch('/products');
    const products = await response.json();

    // Get the container where products will be added
    const produkRow = document.querySelector('.produk-row');

    // Clear existing content
    produkRow.innerHTML = '';

    // Loop through the products and create HTML for each
    products.forEach(product => {
      const productHTML = `
        <div class="produk">
          <img src="${product.product_picture || '../uploads/default.png'}" alt="${product.product_name}">
          <p>${product.product_name}</p>
          <p class="harga">Rp ${parseInt(product.product_price).toLocaleString('id-ID')}</p>
        </div>
      `;
      produkRow.innerHTML += productHTML;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Call the function to fetch and render products
fetchAndRenderProducts();