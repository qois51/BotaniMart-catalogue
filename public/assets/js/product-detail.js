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
      gambarKedua: data.gambarKedua || null,
      gambarKetiga: data.gambarKetiga || null,
      gambarKeempat: data.gambarKeempat || null
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
    const imageBaseUrl = '/uploads/'; 
    mainImage.src = data.picture ? `${imageBaseUrl}${data.picture}` : '../uploads/default.png';
    
    // Handle additional images if they exist
    const previewContainer = document.querySelector('.gambar-preview');
    
    // Clear existing preview images
    if (previewContainer) {
        previewContainer.innerHTML = '';
        
        // Add main image to preview
        const mainPreview = document.createElement('img');
        mainPreview.src = mainImage.src;
        mainPreview.id = 'main1';
        mainPreview.className = 'preview-img active';
        mainPreview.onclick = function() {
            mainImage.src = this.src;
            setActivePreview(this);
        };
        previewContainer.appendChild(mainPreview);
        
        // Add additional images if they exist
        if (data.gambarKedua) {
            addPreviewImage(previewContainer, data.gambarKedua, 'main2', imageBaseUrl);
        } else {
            addPreviewImage(previewContainer, 'default-image.jpg', 'main2', imageBaseUrl);
        }

        if (data.gambarKetiga) {
            addPreviewImage(previewContainer, data.gambarKetiga, 'main3', imageBaseUrl);
        } else {
            addPreviewImage(previewContainer, 'default-image.jpg', 'main3', imageBaseUrl);
        }

        if (data.gambarKeempat) {
            addPreviewImage(previewContainer, data.gambarKeempat, 'main4', imageBaseUrl);
        } else {
            addPreviewImage(previewContainer, 'default-image.jpg', 'main4', imageBaseUrl);
        }
    }
    
    // Update product details
    titleElement.textContent = data.name;
    typeElement.textContent = data.category;
    stockElement.textContent = `Stok: ${data.stock}`;
    priceElement.textContent = `Rp${parseInt(data.price).toLocaleString('id-ID')}`;
    descriptionElement.textContent = data.description;
}

// Helper function to add preview images
function addPreviewImage(container, imagePath, id, baseUrl) {
    const preview = document.createElement('img');
    preview.src = `${baseUrl}${imagePath}`;
    preview.id = id;
    preview.className = 'preview-img';
    preview.onclick = function() {
        document.getElementById('main-image').src = this.src;
        setActivePreview(this);
    };
    container.appendChild(preview);
}

// Helper function to set active preview
function setActivePreview(activeElement) {
    // Remove active class from all preview images
    document.querySelectorAll('.preview-img').forEach(img => {
        img.classList.remove('active');
    });
    // Add active class to clicked image
    activeElement.classList.add('active');
}