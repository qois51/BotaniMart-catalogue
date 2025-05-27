document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileIcon = document.getElementById('profileIcon');
    const profileDropdown = document.getElementById('profileDropdown');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const editProductForm = document.getElementById('editProductForm');
    const mainCategorySelect = document.getElementById('mainCategory');
    const subCategorySelect = document.getElementById('subCategory');
    const mainImagePreview = document.getElementById('mainImagePreview');
    const mainImageUpload = document.getElementById('mainImageUpload');
    const thumbnailPreviews = document.querySelectorAll('.thumb');
    const thumbnailUploads = document.querySelectorAll('.thumb-upload');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showNotification('Product ID is missing. Redirecting to products list...', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-products';
        }, 3000);
        return;
    }
    
    // State variables
    let originalProduct = null;
    let mainImageFile = null;
    let thumbImageFiles = [null, null, null];
    
    // Initialize Jodit Rich Text Editor
    const editor = Jodit.make('#description', {
        height: 300,
        enableDragAndDropFileToEditor: true,
        buttons: [
            'source', '|',
            'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'symbol', 'print'
        ],
        buttonsMD: [
            'bold', 'italic', '|',
            'ul', 'ol', '|',
            'fontsize', 'brush', '|',
            'align', 'undo', 'redo'
        ],
        toolbarSticky: false,
        toolbarAdaptive: true,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        list: {
            defaultTag: 'ul',
            controls: {
                ul: {
                    data: {
                        tag: 'ul',
                        command: 'insertUnorderedList'
                    }
                },
                ol: {
                    data: {
                        tag: 'ol',
                        command: 'insertOrderedList'
                    }
                }
            }
        }
    });

    // Setup profile dropdown toggle
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
    
    // Fetch product data
    fetchProductDetails();
    
    // Setup image previews and uploads
    setupImageUploads();
    
    // Form submit handler
    editProductForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button handler
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            window.location.href = '/admin/admin-products';
        }
    });
    
    // Functions
    async function fetchProductDetails() {
        try {
            const response = await fetch(`/api/products/${productId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            
            const product = await response.json();
            originalProduct = product;
            
            // Populate form with product data
            populateForm(product);
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
        } catch (error) {
            console.error('Error fetching product details:', error);
            showNotification(`Failed to load product: ${error.message}`, 'error');
            
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
        }
    }
    
    function populateForm(product) {
        // Basic fields
        document.getElementById('product-name').value = product.namaProduk || '';
        document.getElementById('latin-name').value = product.namaLatin || '';
        document.getElementById('price').value = product.hargaProduk || '';
        
        // Categories - UPDATE FOR TEXT INPUTS
        mainCategorySelect.value = product.kategoriMain || '';
        subCategorySelect.value = product.kategoriSub || '';
        
        // Description
        if (product.deskripsi) {
            editor.value = product.deskripsi;
        }
        
        // Images
        updateImagePreview(mainImagePreview.querySelector('img'), product.gambarUtama, '/uploads/placeholder.jpeg');
        
        // Update thumbnail previews
        const thumbnailImages = [product.gambarKedua, product.gambarKetiga, product.gambarKeempat];
        thumbnailPreviews.forEach((preview, index) => {
            updateImagePreview(preview.querySelector('img'), thumbnailImages[index], '/uploads/placeholder.jpeg');
        });
    }
    
    function updateImagePreview(imgElement, imagePath, placeholderPath) {
        if (imagePath) {
            imgElement.src = `/uploads/products/${imagePath}`;
            imgElement.dataset.originalSrc = `/uploads/products/${imagePath}`;
            imgElement.dataset.originalName = imagePath;
        } else {
            imgElement.src = placeholderPath;
            imgElement.dataset.originalSrc = '';
            imgElement.dataset.originalName = '';
        }
    }
    
    function setupImageUploads() {
        // Main image click handler
        mainImagePreview.addEventListener('click', function() {
            mainImageUpload.click();
        });
        
        // Main image change handler
        mainImageUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                mainImageFile = file;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    mainImagePreview.querySelector('img').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Thumbnail image handlers
        thumbnailPreviews.forEach((preview, index) => {
            preview.addEventListener('click', function() {
                thumbnailUploads[index].click();
            });
            
            thumbnailUploads[index].addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    thumbImageFiles[index] = file;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.querySelector('img').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();

          // Validate required fields
          const productName = document.getElementById('product-name').value.trim();
          const mainCategory = mainCategorySelect.value.trim();
          const subCategory = subCategorySelect.value.trim();
          const price = document.getElementById('price').value.trim();
    
          // Validation checks
          if (!productName) {
              showNotification('Product name cannot be empty', 'error');
              document.getElementById('product-name').focus();
              return;
          }
    
          if (!mainCategory) {
              showNotification('Main category cannot be empty', 'error');
              mainCategorySelect.focus();
              return;
          }

          if (!subCategory) {
              showNotification('Sub category cannot be empty', 'error');
              subCategorySelect.focus();
              return;
          }
    
          if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
              showNotification('Please enter a valid price', 'error');
              document.getElementById('price').focus();
              return;
          }
    
        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
        try {
            // Create FormData
            const formData = new FormData();
        
            // Add basic fields
            formData.append('namaProduk', document.getElementById('product-name').value);
            formData.append('namaLatin', document.getElementById('latin-name').value);
            formData.append('hargaProduk', document.getElementById('price').value);

            formData.append('kategoriMain', mainCategorySelect.value);
            formData.append('kategoriSub', subCategorySelect.value);
            formData.append('deskripsi', editor.value);
        
            // Log the form data being sent
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
                    `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]));
            }
        
            // Add image files if changed
            if (mainImageFile) {
                formData.append('gambarUtama', mainImageFile);
            } else {
                // Include the original image name if not changed
                const mainImg = mainImagePreview.querySelector('img');
                if (mainImg.dataset.originalName) {
                    formData.append('originalMainImage', mainImg.dataset.originalName);
                    console.log(`Keeping original main image: ${mainImg.dataset.originalName}`);
                }
            }
        
            // To this:
            const imageFieldNames = ['gambarKedua', 'gambarKetiga', 'gambarKeempat'];
            thumbImageFiles.forEach((file, index) => {
                if (file) {
                    formData.append(imageFieldNames[index], file);
                    console.log(`Adding ${imageFieldNames[index]} file: ${file.name}`);
                } else {
                    // Include the original thumbnail name if not changed
                    const thumbImg = thumbnailPreviews[index].querySelector('img');
                    if (thumbImg.dataset.originalName) {
                        formData.append(`original${imageFieldNames[index].charAt(0).toUpperCase() + imageFieldNames[index].slice(1)}`, thumbImg.dataset.originalName);
                        console.log(`Keeping original ${imageFieldNames[index]}: ${thumbImg.dataset.originalName}`);
                    }
                }
            });
        
            // Log request info
            console.log(`Sending PUT request to: /api/products/${productId}`);
        
            // Send update request
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                body: formData // FormData will automatically set correct Content-Type with boundary
            });
        
            console.log(`Response status: ${response.status}`);
        
            if (!response.ok) {
                // Try to parse error response
                let errorDetail = '';
                try {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    errorDetail = errorData.message || errorData.error || 'Unknown error';
                } catch (jsonError) {
                    // If the response is not valid JSON, try to get text
                    const textResponse = await response.text();
                    console.error('Non-JSON response:', textResponse);
                    errorDetail = `Server error (${response.status})`;
                }
            
                throw new Error(errorDetail || 'Failed to update product');
            }
        
            // Show success message
            showNotification('Product updated successfully!', 'success');
        
            // Redirect back to products list after a short delay
            setTimeout(() => {
                window.location.href = '/admin/admin-products';
            }, 2000);
        
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification(`Failed to update product: ${error.message}`, 'error');
        
        } finally {
            // Reset button
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const notificationClose = document.getElementById('notification-close');
        
        // Set message and type
        notificationMessage.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        
        // Close handler
        notificationClose.addEventListener('click', function() {
            notification.style.display = 'none';
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
});