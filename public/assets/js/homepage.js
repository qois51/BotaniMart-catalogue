document.addEventListener("DOMContentLoaded", function () {
  // === VARIABEL GLOBAL ===
  let allProducts = [];
  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
  const searchInput = document.querySelector('.search_bar input');
  const searchBar = document.querySelector('.search_bar');
  const historyDropdown = document.createElement('div');
  historyDropdown.className = 'search-history';
  searchBar.appendChild(historyDropdown);

  // === SIDEBAR DROPDOWN ===
  document.querySelectorAll(".dropdown-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const subKategori = this.nextElementSibling;
      const icon = this.querySelector(".fa-caret-down");
      subKategori.classList.toggle("show");
      icon.classList.toggle("rotate");
    });
  });

  // === FUNGSI PRODUK ===
  async function fetchAndRenderProducts() {
    try {
      const response = await fetch('/products');
      allProducts = await response.json();
      renderProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  function renderProducts(products) {
    const produkRow = document.querySelector('.produk-row');
    produkRow.innerHTML = products.map(product => `
      <a href="views/product-details.html?id=${product.id_product}" class="produk-link">
        <div class="produk">
          <img src="${product.product_picture || '../uploads/default.png'}" alt="${product.product_name}">
          <p>${product.product_name}</p>
          <p class="harga">Rp ${parseInt(product.product_price).toLocaleString('id-ID')}</p>
        </div>
      </a>
    `).join('');
  }

  // === FUNGSI PENCARIAN ===
  function searchProducts(keyword) {
    const filtered = allProducts.filter(product => 
      product.product_name.toLowerCase().includes(keyword.toLowerCase())
    );
    renderProducts(filtered);
  }

  

  // === EVENT LISTENERS ===
  document.querySelector('.search-btn').addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    searchProducts(keyword);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      searchProducts(keyword);
    }
  });

  searchInput.addEventListener('focus', () => renderSearchHistory());
  
  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      historyDropdown.style.display = 'none';
    }
  });

  // === INISIALISASI ===
  fetchAndRenderProducts();
  renderSearchHistory();
});