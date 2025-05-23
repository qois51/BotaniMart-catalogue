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
                console.log('Admin data:', data.username);
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
            
            updateStats();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsList.innerHTML = `<tr><td colspan="9" class="error-message">Failed to load products. Please try again later.</td></tr>`;
        }
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
            
            const matchesCategory = !category || 
                product.kategoriMain === category;
            
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
                
            return `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${image}" alt="${product.namaProduk}"></td>
                    <td>
                        <div>${product.namaProduk}</div>
                        <small class="latin-name">${product.namaLatin || ''}</small>
                    </td>
                    <td>${product.kategoriMain}${product.kategoriSub ? ` / ${product.kategoriSub}` : ''}</td>
                    <td>Rp ${price}</td>
                    <td>${product.views || 0}</td>
                    <td>${date}</td>
                    <td>
                        <div class="action-btns">
                            <a href="editproduct.html?id=${product.id}" class="btn">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                            <button class="btn delete-btn" onclick="openDeleteModal(${product.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // Make the delete function available globally
    window.openDeleteModal = function(productId) {
        currentProductIdToDelete = productId;
        deleteModal.style.display = 'flex';
    };
    

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
                // Success - remove product from DOM
                const productElement = document.querySelector(`[data-product-id="${productId}"]`);
                if (productElement) {
                    productElement.remove();
                }
                
                // Remove product from arrays
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
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add event listener to close button
        notification.querySelector('.close-notification').addEventListener('click', function() {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }
});