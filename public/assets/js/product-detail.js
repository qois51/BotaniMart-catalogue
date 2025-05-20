document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        console.error("ID produk tidak ditemukan di URL.");
        return;
    }
    
    // Fetch product data
    fetchProductData(id);
});

async function fetchProductData(productId) {
  try {
    // Fetch product data from API using GET with ID parameter
    const response = await fetch(`/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product data: ${response.status}`);
    }

    const data = await response.json();
    console.log("Product data received:", data); // Debug log

    // Update product details in the DOM
    updateProductDetails({
      name: data.namaProduk,
      price: data.hargaProduk,
      description: data.deskripsi,
      stock: data.stockProduk,
      category: data.kategoriMain,
      picture: data.gambarUtama,
    });
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    document.getElementById('product-container').innerHTML = 
      `<div class="error-message">Error: ${error.message}</div>`;
  }
}

function updateProductDetails(data) {
    const mainImage = document.getElementById('main-image');
    const titleElement = document.getElementById('product-name');
    const typeElement = document.getElementById('product-type');
    const stockElement = document.getElementById('stok-info');
    const priceElement = document.getElementById('product-price');
    const descriptionElement = document.getElementById('product-desc');
    
    // Update image source with full path
    const imageBaseUrl = '/uploads/'; // Update with your actual image base URL
    mainImage.src = data.picture ? `${imageBaseUrl}${data.picture}` : '../uploads/default.png';
    
    // Update product details
    titleElement.textContent = data.name;
    typeElement.textContent = data.category;
    stockElement.textContent = `Stok: ${data.stock}`;
    priceElement.textContent = `Rp${parseInt(data.price).toLocaleString('id-ID')}`;
    descriptionElement.textContent = data.description;
}