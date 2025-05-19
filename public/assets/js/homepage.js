// Jalankan setelah DOM siap
document.addEventListener("DOMContentLoaded", function () {
  // ==== SIDEBAR DROPDOWN ====
  const dropdownButtons = document.querySelectorAll(".dropdown-btn");

  dropdownButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const subKategori = this.nextElementSibling;
      const icon = this.querySelector(".fa-caret-down");
      subKategori.classList.toggle("show");
      icon.classList.toggle("rotate");
    });
  });

  // ==== FETCH & RENDER PRODUK ====
  async function fetchAndRenderProducts() {
    try {
      // Fetch data dari API
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

  // Jalankan saat halaman dimuat
  fetchAndRenderProducts();
});
