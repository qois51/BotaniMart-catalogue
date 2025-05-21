document.addEventListener("DOMContentLoaded", function () {
  // === VARIABEL GLOBAL ===
  let allProducts = [];
  const searchInput = document.querySelector('.search_bar input');
  const searchBar = document.querySelector('.search_bar');
  const historyDropdown = document.createElement('div');
  historyDropdown.className = 'search-history';
  searchBar.style.position = 'relative';
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
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      allProducts = await response.json();
      renderProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  function renderProducts(products) {
      const produkRow = document.querySelector('.produk-row');
      const basePath = '../uploads/'; 

      produkRow.innerHTML = products.map(product => {
          const imageUrl = product.gambarUtama ? basePath + product.gambarUtama : '../uploads/default.png';
          return `
              <a href="views/product-details.html?id=${product.id}" class="produk-link">
                  <div class="produk">
                      <img src="${imageUrl}" alt="${product.namaProduk}">
                      <p>${product.namaProduk}</p>
                      <p class="harga">Rp ${parseInt(product.hargaProduk).toLocaleString('id-ID')}</p>
                  </div>
              </a>
          `;
      }).join('');
  }

  // === LIVE SEARCH DROPDOWN ===
  function renderLiveSearchDropdown(filteredProducts) {
    historyDropdown.innerHTML = '';

    if (filteredProducts.length === 0) {
      historyDropdown.style.display = 'none';
      return;
    }

    filteredProducts.slice(0, 5).forEach(product => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = product.namaProduk;

      // Tambahkan event listener untuk redirect ke halaman detail
      item.addEventListener('click', () => {
        window.location.href = `views/product-details.html?id=${product.id}`;
      });

      historyDropdown.appendChild(item);
    });

    historyDropdown.style.display = 'block';
  }

  // === FUNGSI PENCARIAN ===
  function searchProducts(keyword) {
    const filtered = allProducts.filter(product => 
      product.namaProduk.toLowerCase().includes(keyword.toLowerCase())
    );
    renderProducts(filtered);
  }

  // === EVENT LISTENERS ===
  document.querySelector('.search-btn').addEventListener('click', () => {
    const keyword = searchInput.value.trim();
    searchProducts(keyword);
    historyDropdown.style.display = 'none';
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      searchProducts(keyword);
      historyDropdown.style.display = 'none';
    }
  });

  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim();
    const filtered = allProducts.filter(product =>
      product.namaProduk.toLowerCase().includes(keyword.toLowerCase())
    );
    renderLiveSearchDropdown(filtered);
  });

  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      historyDropdown.style.display = 'none';
    }
  });

  // === FILTER FUNCTIONS ===
  function renderCategories(categoriesMain, categoriesSub) {
    const categoryListContainer = document.querySelector('.list-kategori');

    // Remove existing categories
    while (categoryListContainer && categoryListContainer.firstChild) {
      categoryListContainer.removeChild(categoryListContainer.firstChild);
    }

    // Show all button
    const showAllItem = document.createElement('li');
    const showAllBtn = document.createElement('button');
    showAllBtn.className = 'dropdown-btn';
    showAllBtn.textContent = 'Semua Produk';
    showAllBtn.addEventListener('click', () => {
      renderProducts(allProducts);
      resetActiveCategories();
      showAllBtn.classList.add('active');
    });
    showAllItem.appendChild(showAllBtn);
    categoryListContainer.appendChild(showAllItem);

    // Group subcategories by main category
    const categoryMap = {};
    categoriesMain.forEach(main => {
      categoryMap[main] = [];
    });
  
    allProducts.forEach(product => {
      if (product.kategoriMain && product.kategoriSub) {
        if (!categoryMap[product.kategoriMain].includes(product.kategoriSub)) {
          categoryMap[product.kategoriMain].push(product.kategoriSub);
        }
      }
    });

    // Create HTML elements for each main category and its subcategories
    categoriesMain.forEach(mainCategory => {
      const mainCategoryItem = document.createElement('li');
      mainCategoryItem.className = 'dropdown';

      const dropdownBtn = document.createElement('button');
      dropdownBtn.className = 'dropdown-btn';
      dropdownBtn.innerHTML = `${mainCategory} <i class="fas fa-caret-down"></i>`;
    
      // Add click handler for dropdown toggle only (no filtering)
      dropdownBtn.addEventListener('click', function(e) {
        // Toggle dropdown visibility
        this.classList.toggle('dropdown-open');
        const icon = this.querySelector('.fa-caret-down');
        icon.classList.toggle('rotate');
        const subMenu = this.nextElementSibling;
        if (subMenu.style.display === 'block') {
          subMenu.style.display = 'none';
        } else {
          subMenu.style.display = 'block';
        }
      });

      const subCategoryList = document.createElement('ul');
      subCategoryList.className = 'sub-kategori';
      subCategoryList.style.display = 'none'; // Hidden by default

      const allOption = document.createElement('li');
      const allLink = document.createElement('a');
      allLink.href = '#';
      allLink.textContent = 'All';
      allLink.addEventListener('click', (e) => {
        e.preventDefault();
        const filtered = allProducts.filter(product => 
          product.kategoriMain === mainCategory
        );
        renderProducts(filtered);
        resetActiveSubcategories();
        allLink.classList.add('active-subcategory');
      });
      allOption.appendChild(allLink);
      subCategoryList.appendChild(allOption);

      categoryMap[mainCategory].forEach(subCategory => {
        const subCategoryItem = document.createElement('li');
        const subCategoryLink = document.createElement('a');
        subCategoryLink.href = '#';
        subCategoryLink.textContent = subCategory;

        subCategoryLink.addEventListener('click', (e) => {
          e.preventDefault();
          const filtered = allProducts.filter(product => 
            product.kategoriMain === mainCategory && 
            product.kategoriSub === subCategory
          );
          renderProducts(filtered);
          resetActiveSubcategories();
          subCategoryLink.classList.add('active-subcategory');
        });

        subCategoryItem.appendChild(subCategoryLink);
        subCategoryList.appendChild(subCategoryItem);
      });

      mainCategoryItem.appendChild(dropdownBtn);
      mainCategoryItem.appendChild(subCategoryList);

      categoryListContainer.appendChild(mainCategoryItem);
    });
  }

  // Helper function to reset active state of all category buttons
  function resetActiveCategories() {
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // Helper function to reset active state of all subcategory links
  function resetActiveSubcategories() {
    document.querySelectorAll('.sub-kategori a').forEach(link => {
      link.classList.remove('active-subcategory');
    });
  }

  // Filter products function that can be used elsewhere in the code
  function filterProducts(mainCategory = null, subCategory = null) {
    let filtered;
  
    if (mainCategory && subCategory) {
      // Filter by both main category and subcategory
      filtered = allProducts.filter(product => 
        product.kategoriMain === mainCategory && 
        product.kategoriSub === subCategory
      );
    } else if (mainCategory) {
      // Filter by main category only
      filtered = allProducts.filter(product => 
        product.kategoriMain === mainCategory
      );
    } else {
      // No filter, show all products
      filtered = allProducts;
    }
  
    renderProducts(filtered);
  
    // Update UI to show which category is active
    resetActiveCategories();
    resetActiveSubcategories();
  
    if (mainCategory) {
      // Find and activate the corresponding category button
      document.querySelectorAll('.dropdown-btn').forEach(btn => {
        if (btn.textContent.includes(mainCategory)) {
          btn.classList.add('active');
        }
      });
    
      if (subCategory) {
        // Find and activate the corresponding subcategory link
        document.querySelectorAll('.sub-kategori a').forEach(link => {
          if (link.textContent === subCategory) {
            link.classList.add('active-subcategory');
          }
        });
      }
    } else {
      // No category selected, activate "Show All" button
      document.querySelector('.show-all-btn')?.classList.add('active');
    }
  }


  async function getCategory() {
    try {
      const response = await fetch('/products');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const temp = await response.json();
      const categoriesMain = [...new Set(temp.map(product => product.kategoriMain))];
      const categoriesSub = [...new Set(temp.map(product => product.kategoriSub))];

      renderCategories(categoriesMain, categoriesSub);

    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // === INISIALISASI ===
  fetchAndRenderProducts();
  getCategory();
});