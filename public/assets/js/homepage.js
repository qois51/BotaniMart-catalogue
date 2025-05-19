document.addEventListener("DOMContentLoaded", function () {
  // === SIDEBAR DROPDOWN KATEGORI ===
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");

  dropdownButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const subKategori = this.nextElementSibling;
      const icon = this.querySelector(".fa-caret-down");
      subKategori.classList.toggle("show");
      icon.classList.toggle("rotate");
    });
  });

  // === FETCH & RENDER PRODUK ===
  async function fetchAndRenderProducts() {
    try {
      const response = await fetch('/products');
      const products = await response.json();

      const produkRow = document.querySelector('.produk-row');
      produkRow.innerHTML = '';

      products.forEach(product => {
        const productHTML = `
          <a href="views/product-details.html?id=${product.id_product}" class="produk-link">
            <div class="produk">
              <img src="${product.product_picture || '../uploads/default.png'}" alt="${product.product_name}">
              <p>${product.product_name}</p>
              <p class="harga">Rp ${parseInt(product.product_price).toLocaleString('id-ID')}</p>
            </div>
          </a>
        `;
        produkRow.innerHTML += productHTML;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  // === SEARCH HISTORY DROPDOWN ===
  const searchInput = document.querySelector('.search_bar input');
  const searchBar = document.querySelector('.search_bar');

  // Buat elemen dropdown history
  const historyDropdown = document.createElement('div');
  historyDropdown.classList.add('search-history');
  searchBar.appendChild(historyDropdown);

  let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

  function renderSearchHistory() {
    historyDropdown.innerHTML = '';
    if (searchHistory.length === 0) {
      historyDropdown.style.display = 'none';
      return;
    }

    searchHistory.slice(-5).reverse().forEach(term => {
      const item = document.createElement('div');
      item.classList.add('history-item');
      item.textContent = term;
      item.addEventListener('click', () => {
        searchInput.value = term;
        historyDropdown.style.display = 'none';
        // Tambahkan logika pencarian jika dibutuhkan
      });
      historyDropdown.appendChild(item);
    });

    historyDropdown.style.display = 'block';
  }

  // Tampilkan riwayat saat fokus
  searchInput.addEventListener('focus', renderSearchHistory);

  // Sembunyikan saat klik di luar
  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      historyDropdown.style.display = 'none';
    }
  });

  // Simpan ke history saat pencarian dilakukan (Enter)
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const value = searchInput.value.trim();
      if (value && !searchHistory.includes(value)) {
        searchHistory.push(value);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      }
      historyDropdown.style.display = 'none';
    }
  });

  // Panggil produk saat halaman dimuat
  fetchAndRenderProducts();
});
