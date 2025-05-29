let viewsChart = null;
let lastViewsData = {}; // Store the last known view counts
let pollingInterval = null; // To store the interval ID
const POLL_INTERVAL = 5000; 


// Add this function to create the chart
function createViewsChart(data, limit = 10) {
    // Clear any existing chart
    Plotly.purge('views-chart');
    
    // Get the container element
    const chartElement = document.getElementById('views-chart');
    
    // If no data or chart element doesn't exist, return
    if (!data || !data.length || !chartElement) {
        return;
    }
    
    // Sort data by views (descending)
    const sortedData = [...data].sort((a, b) => (b.views || 0) - (a.views || 0));
    
    // Limit the data if specified
    const chartData = limit === 'all' ? sortedData : sortedData.slice(0, parseInt(limit, 10));
    
    // Prepare data for chart
    const productNames = chartData.map(product => {
        // Truncate long names for better display
        return product.namaProduk.length > 20 
            ? product.namaProduk.substring(0, 20) + '...' 
            : product.namaProduk;
    });
    
    const viewCounts = chartData.map(product => product.views || 0);
    const colors = chartData.map(product => {
        const maxViews = sortedData[0].views || 1; 
        const intensity = Math.min(1, 0.3 + ((product.views || 0) / (maxViews * 1.5)));
        return `rgba(46, 125, 50, ${intensity})`;
    });
    
    // Create bar chart trace
    const trace = {
        x: productNames,
        y: viewCounts,
        type: 'bar',
        marker: {
            color: colors
        },
        hovertemplate: '<b>%{x}</b><br>Views: %{y}<extra></extra>'
    };
    
    // Layout configuration
    const layout = {
        title: `Top ${limit === 'all' ? 'All' : limit} Products by Views`,
        xaxis: {
            title: 'Product',
            tickangle: 0
        },
        yaxis: {
            title: 'Number of Views'
        },
        margin: {
            l: 50,
            r: 20,
            b: 100,
            t: 50,
            pad: 4
        },
        bargap: 0.2,
        font: {
            family: 'Arial, sans-serif'
        }
    };
    
    // Config for responsiveness and toolbar
    const config = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    // Create the chart
    Plotly.newPlot('views-chart', [trace], layout, config);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips    
    const profileIcon = document.getElementById('profileIcon');
    const profileDropdown = document.getElementById('profileDropdown');
    const adminNameElement = document.getElementById('adminName');

    fetchCurrentAdmin();

    async function fetchCurrentAdmin() {
        try {
            const response = await fetch('/auth/check', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                adminNameElement.textContent = data.username;
            } else {
                console.log('Not authenticated or failed to fetch user data');
                adminNameElement.textContent = 'Guest';
            }
        } catch (error) {
            console.error('Error fetching admin info:', error);
            adminNameElement.textContent = 'Admin';
        }
    }
    
    if (profileIcon && profileDropdown) {
        // Toggle dropdown on profile icon click
        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        
        // Prevent clicks inside dropdown from closing it
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Close dropdown when clicking elsewhere on the page
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
        });
        
        // Handle logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            fetch('/auth/logout', { credentials: 'include' })
              .finally(() => {
                window.location.href = '/admin';
              });
          });
        }
    }

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const productsList = document.getElementById('products-list');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Stats elements
    const totalProductsElement = document.getElementById('total-products');
    const mostViewedElement = document.getElementById('most-viewed');
    const latestAdditionElement = document.getElementById('latest-addition');

    // Delete modal elements
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    
    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = 10;
    let currentProductIdToDelete = null;


    // Add these new references for chart controls
    const toggleChartBtn = document.getElementById('toggle-chart-btn');
    const chartLimitSelect = document.getElementById('chart-limit');
    const viewsChartElement = document.getElementById('views-chart');
    
    if (toggleChartBtn) {
        toggleChartBtn.addEventListener('click', function() {
            if (viewsChartElement.style.display === 'none') {
                viewsChartElement.style.display = 'block';
                toggleChartBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Hide Chart';
            } else {
                viewsChartElement.style.display = 'none';
                toggleChartBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Show Chart';
            }
        });
    }
    
    // Function to check for product updates
    async function checkForUpdates() {
        try {
            const response = await fetch('/api/products?nocache=' + Date.now(), {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch updated products');
            }
        
            const updatedProducts = await response.json();
            let hasChanges = false;
        
            for (const product of updatedProducts) {
                const productId = product.id;
                const currentViews = product.views || 0;
            
                // If we have past data for this product and views have changed
                if (lastViewsData[productId] !== undefined && 
                    lastViewsData[productId] !== currentViews) {
                    hasChanges = true;
                    break;
                }
            }
        
            // If changes detected, update the page
            if (hasChanges) {
                console.log("Product view counts changed, refreshing data...");
            
                // Update all products
                allProducts = updatedProducts;
            
                // Re-apply current filters
                filterProducts();
            
                // Update the statistics
                updateStats();
            
                // Update the chart if it exists
                if (document.getElementById('views-chart')) {
                    createViewsChart(allProducts, document.getElementById('chart-limit')?.value || 10);
                }
            
                // Show notification about the update
                showNotification('Product data has been updated with latest views', 'info');
            }
        
            // Store the current view counts for next comparison
            lastViewsData = {};
            for (const product of updatedProducts) {
                lastViewsData[product.id] = product.views || 0;
            }
        
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    if (chartLimitSelect) {
        chartLimitSelect.addEventListener('change', function() {
            createViewsChart(allProducts, this.value);
        });
    }

    // Products state
    let allProducts = [];
    let filteredProducts = [];
    
    // Event listeners
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });
    
    categoryFilter.addEventListener('change', filterProducts);
    sortBy.addEventListener('change', filterProducts);
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    });
    
    // Modal event listeners
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
        currentProductIdToDelete = null;
    });

    // Confirm delete button event listener
    confirmDeleteBtn.addEventListener('click', function() {
        if (currentProductIdToDelete) {
            deleteProduct(currentProductIdToDelete);
        }
    });

    // Load products on page load
    fetchProducts();

    // Functions
    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            allProducts = await response.json();
            filteredProducts = [...allProducts];

            lastViewsData = {};
            allProducts.forEach(product => {
                lastViewsData[product.id] = product.views || 0;
            });
            
            updateStats();
            renderProducts();

            const categoriesMain = [...new Set(allProducts.map(product => product.kategoriMain))];
            const categoriesSub = [...new Set(allProducts.map(product => product.kategoriSub).filter(Boolean))];

            renderCategories(categoriesMain, categoriesSub);

            if (document.getElementById('views-chart')) {
                createViewsChart(allProducts, document.getElementById('chart-limit')?.value || 10);
            }

            startPolling();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsList.innerHTML = `<tr><td colspan="9" class="error-message">Failed to load products. Please try again later.</td></tr>`;
        }
    }

    async function getCategory() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const temp = await response.json();
        const categoriesMain = [...new Set(temp.map(product => product.kategoriMain))];
        const categoriesSub = [...new Set(temp.map(product => product.kategoriSub).filter(Boolean))];

        renderCategories(categoriesMain, categoriesSub);

      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    // Add this function to render the categories to the dropdown
    function renderCategories(mainCategories, subCategories) {
      const categoryFilter = document.getElementById('category-filter');
  
      // Keep the "All Categories" option
      categoryFilter.innerHTML = '<option value="">All Categories</option>';
  
      // Sort categories alphabetically
      mainCategories.sort();

      const subCategoryMap = {};  

      // Initialize the map
      mainCategories.forEach(main => {
          if (main) subCategoryMap[main] = [];
      });

      // Map products to get subcategories grouped by main category
      allProducts.forEach(product => {
          if (product.kategoriMain && product.kategoriSub) {
              if (!subCategoryMap[product.kategoriMain]) {
                  subCategoryMap[product.kategoriMain] = [];
              }
            
              if (!subCategoryMap[product.kategoriMain].includes(product.kategoriSub)) {
                  subCategoryMap[product.kategoriMain].push(product.kategoriSub);
              }
          }
      });

      mainCategories.forEach(category => {
          if (category) {
              const mainOption = document.createElement('option');
              mainOption.value = category;
              mainOption.textContent = category;
              mainOption.className = 'main-category-option';
              categoryFilter.appendChild(mainOption);
            
              if (subCategoryMap[category] && subCategoryMap[category].length > 0) {
                  subCategoryMap[category].sort().forEach(subCat => {
                      const subOption = document.createElement('option');
                      subOption.value = `sub:${subCat}`;
                      subOption.textContent = `↳ ${subCat}`;
                      subOption.style.paddingLeft = '15px';
                      subOption.className = 'sub-category-option';
                      categoryFilter.appendChild(subOption);
                  });
              }
          }
      });
    
      const orphanedSubs = subCategories.filter(sub => {
          for (const main in subCategoryMap) {
              if (subCategoryMap[main].includes(sub)) {
                  return false;
              }
          }
          return true;
      });
    
      if (orphanedSubs.length > 0) {
          const divider = document.createElement('option');
          divider.disabled = true;
          divider.textContent = '── Other Subcategories ──';
          categoryFilter.appendChild(divider);
        
          orphanedSubs.sort().forEach(subCat => {
              const option = document.createElement('option');
              option.value = `sub:${subCat}`;
              option.textContent = `↳ ${subCat}`;
              option.style.paddingLeft = '15px';
              categoryFilter.appendChild(option);
          });
      }

    }

    function startPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
    
        pollingInterval = setInterval(checkForUpdates, POLL_INTERVAL);
    
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                checkForUpdates();
            }
        });
    }
    
    function updateStats() {
        // Calculate stats
        const totalProducts = allProducts.length;
        
        // Find most viewed product
        let mostViewed = allProducts.reduce((prev, current) => 
            (prev.views || 0) > (current.views || 0) ? prev : current, {views: 0});
        
        // Find latest addition
        let latest = allProducts.reduce((prev, current) => 
            new Date(current.createdAt) > new Date(prev.createdAt) ? current : prev, 
            {createdAt: new Date(0)});
        
        // Update stats display
        totalProductsElement.textContent = totalProducts;
        
        if (mostViewed.namaProduk) {
            mostViewedElement.textContent = `${mostViewed.namaProduk} (${mostViewed.views || 0})`;
        }
        
        if (latest.namaProduk) {
            const date = new Date(latest.createdAt);
            latestAdditionElement.textContent = `${latest.namaProduk} (${date.toLocaleDateString()})`;
        }
    }
    
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;
        const sort = sortBy.value;
        
        // Filter products
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = !searchTerm || 
                product.namaProduk.toLowerCase().includes(searchTerm) || 
                (product.namaLatin && product.namaLatin.toLowerCase().includes(searchTerm));
            
            // Enhanced category matching to support subcategories
            let matchesCategory = !category; // true if no category selected

            if (category) {
              if (category.startsWith('sub:')) {
                // This is a subcategory filter
                const subCat = category.replace('sub:', '');
                matchesCategory = product.kategoriSub === subCat;
              } else {
                // This is a main category filter
                matchesCategory = product.kategoriMain === category;
              }
            }
          
            return matchesSearch && matchesCategory;
        });
        
        // Sort products
        filteredProducts.sort((a, b) => {
            switch (sort) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name-asc':
                    return a.namaProduk.localeCompare(b.namaProduk);
                case 'name-desc':
                    return b.namaProduk.localeCompare(a.namaProduk);
                case 'price-low':
                    return parseFloat(a.hargaProduk) - parseFloat(b.hargaProduk);
                case 'price-high':
                    return parseFloat(b.hargaProduk) - parseFloat(a.hargaProduk);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                default:
                    return 0;
            }
        });
        
        currentPage = 1;
        renderProducts();
    }
    
    function renderProducts() {
        // Calculate pagination
        totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Update pagination controls
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        // Render products
        if (paginatedProducts.length === 0) {
            productsList.innerHTML = `<tr><td colspan="9" class="empty-message">No products found matching your criteria.</td></tr>`;
            return;
        }
        
        productsList.innerHTML = paginatedProducts.map(product => {
            const date = new Date(product.createdAt).toLocaleDateString();
            const price = parseInt(product.hargaProduk).toLocaleString('id-ID');
            const image = product.gambarUtama ? 
                `/uploads/products/${product.gambarUtama}` : 
                '/uploads/placeholder.jpeg';
            const mainCategory = product.kategoriMain || '-';
            const subCategory = product.kategoriSub || '-';
                
            return `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${image}" alt="${product.namaProduk}"></td>
                    <td>
                        <div>${product.namaProduk}</div>
                        <small class="latin-name">${product.namaLatin || ''}</small>
                    </td>
                    <td>${mainCategory}</td>
                    <td>${subCategory}</td>
                    <td>Rp ${price}</td>
                    <td>${product.views || 0}</td>
                    <td>${date}</td>
                    <td>
                        <div class="action-btns">
                            <a href="edit-product?id=${product.id}" class="btn">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                            <button class="btn delete-btn" data-product-id="${product.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Setelah renderProducts, tambahkan event listener untuk tombol delete
        document.querySelectorAll('.delete-btn[data-product-id]').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                openDeleteModal(productId);
            });
        });
    }
    
    function openDeleteModal(productId) {
        currentProductIdToDelete = productId;
        deleteModal.style.display = 'flex';
    }

    // Function to delete a product
    async function deleteProduct(productId) {
        try {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Include cookies for authentication
            });

            // Check content type to handle HTML responses
            const contentType = response.headers.get('content-type');
            
            // Handle response
            if (response.ok) {
                // Success
                allProducts = allProducts.filter(p => p.id !== productId);
                filteredProducts = filteredProducts.filter(p => p.id !== productId);

                // Update stats and re-render products
                updateStats();
                renderProducts();

                // Show success message
                showNotification('Product deleted successfully', 'success');
            } else {
                // Error handling
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification(`Failed to delete product: ${error.message}`, 'error');
        } finally {
            // Hide modal and reset state
            deleteModal.style.display = 'none';
            currentProductIdToDelete = null;
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = 'Delete';
        }
    }

        // Notification function
        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;

            // Conditionally add close button
            if (type === 'success') {
                notification.innerHTML = `<span>${message}</span>`;
            } else {
                notification.innerHTML = `
                    <span>${message}</span>
                    <button class="close-notification">&times;</button>
                `;
            }

            // Add to DOM
            document.body.appendChild(notification);

            // Add event listener to close button if not success
            if (type !== 'success') {
                notification.querySelector('.close-notification').addEventListener('click', function () {
                    notification.remove();
                });
            }

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 5000);
        }
});

// Add this to clean up the interval when user leaves the page
window.addEventListener('beforeunload', function() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});