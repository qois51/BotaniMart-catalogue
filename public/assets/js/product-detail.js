document.addEventListener('DOMContentLoaded', async () => {
  // === Ambil ID Produk dari URL ===
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    console.error("ID produk tidak ditemukan di URL.");
    return;
  }

  incrementProductViews(id);
  fetchProductData(id);

  // === LIVE SEARCH DROPDOWN ===
  let allProducts = [];
  const searchInput = document.querySelector('.search_bar input');
  const searchBar = document.querySelector('.search_bar');
  const historyDropdown = document.createElement('div');
  historyDropdown.className = 'search-history';
  searchBar.appendChild(historyDropdown);

  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    allProducts = await response.json();
  } catch (err) {
    console.error('Error fetching products for search:', err);
  }

  function renderLiveSearchDropdown(filteredProducts) {
    historyDropdown.innerHTML = '';

    if (filteredProducts.length === 0) {
      historyDropdown.style.display = 'none';
      searchBar.classList.remove('dropdown-active');
      return;
    }

    filteredProducts.slice(0, 5).forEach(product => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = product.namaProduk;
      item.addEventListener('click', () => {
        window.location.href = `product-details?id=${product.id}`;
      });
      historyDropdown.appendChild(item);
    });

    historyDropdown.style.display = 'block';
    searchBar.classList.add('dropdown-active');
  }

  function searchProducts(keyword) {
    const filtered = allProducts.filter(product =>
      product.namaProduk.toLowerCase().includes(keyword.toLowerCase())
    );
    renderLiveSearchDropdown(filtered);
  }

  document.querySelector('.search-btn').addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    const result = allProducts.find(product =>
      product.namaProduk.toLowerCase().includes(keyword.toLowerCase())
    );
    if (result) {
      window.location.href = `product-details?id=${result.id}`;
    } else {
      alert("Produk tidak ditemukan.");
    }
    historyDropdown.style.display = 'none';
    searchBar.classList.remove('dropdown-active');
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      const result = allProducts.find(product =>
        product.namaProduk.toLowerCase().includes(keyword.toLowerCase())
      );
      if (result) {
        window.location.href = `product-details?id=${result.id}`;
      } else {
        alert("Produk tidak ditemukan.");
      }
      historyDropdown.style.display = 'none';
      searchBar.classList.remove('dropdown-active');
    }
  });

  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim();
    searchProducts(keyword);
  });

  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      historyDropdown.style.display = 'none';
      searchBar.classList.remove('dropdown-active');
    }
  });
});

// === FETCH & UPDATE DETAIL PRODUK ===
async function fetchProductData(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Failed to fetch product data: ${response.status}`);

    const data = await response.json();

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

async function incrementProductViews(productId) {
  try {
    const response = await fetch(`/api/products/${productId}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.error('Gagal update views produk');
    }
  } catch (error) {
    console.error('Error saat update views produk:', error);
  }
}

function updateProductDetails(data) {
  const mainImage = document.getElementById('main-image');
  const titleElement = document.getElementById('product-name');
  const typeElement = document.getElementById('product-type');
  const stockElement = document.getElementById('stok-info');
  const priceElement = document.getElementById('product-price');
  const descriptionElement = document.getElementById('product-desc');

  // Update the image base URL to point to the products folder
  const imageBaseUrl = '/uploads/products/';
  mainImage.src = (data.picture && data.picture !== 'null') ? `${imageBaseUrl}${data.picture}` : '/uploads/placeholder.jpeg';

  const previewContainer = document.querySelector('.gambar-preview');
  if (previewContainer) {
    previewContainer.innerHTML = '';

    const mainPreview = document.createElement('img');
    mainPreview.src = mainImage.src;
    mainPreview.id = 'main1';
    mainPreview.className = 'preview-img active';
    mainPreview.onclick = function () {
      mainImage.src = this.src;
      setActivePreview(this);
    };
    previewContainer.appendChild(mainPreview);

    // Add additional previews - update default image path
    const defaultImage = '/uploads/placeholder.jpeg';

    addPreviewImage(previewContainer, data.gambarKedua, 'main2', imageBaseUrl, defaultImage);
    addPreviewImage(previewContainer, data.gambarKetiga, 'main3', imageBaseUrl, defaultImage);
    addPreviewImage(previewContainer, data.gambarKeempat, 'main4', imageBaseUrl, defaultImage);
  }

  titleElement.textContent = data.name;
  typeElement.textContent = data.category;
  stockElement.textContent = `Stok: ${data.stock}`;
  priceElement.textContent = `Rp${parseInt(data.price).toLocaleString('id-ID')}`;
  descriptionElement.innerHTML = data.description;
}

function addPreviewImage(container, imagePath, id, baseUrl, defaultImage) {
  const preview = document.createElement('img');
  if (imagePath && imagePath !== 'null') {
    preview.src = `${baseUrl}${imagePath}`;
  } else {
    preview.src = defaultImage;
  }
  preview.id = id;
  preview.className = 'preview-img';
  
  // Add error handler to use default image if the actual image fails to load
  preview.onerror = function() {
    this.src = defaultImage;
    console.log('Image failed to load, using placeholder instead');
  };
  
  preview.onclick = function () {
    document.getElementById('main-image').src = this.src;
    setActivePreview(this);
  };
  
  container.appendChild(preview);
}

function setActivePreview(activeElement) {
  document.querySelectorAll('.preview-img').forEach(img => {
    img.classList.remove('active');
  });
  activeElement.classList.add('active');
}
