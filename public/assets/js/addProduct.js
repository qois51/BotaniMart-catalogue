document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form-section');
    const addProductBtn = document.querySelector('.add-product');
    const mainImageElement = document.querySelector('.main-image');
    const mainImageContainer = document.querySelector('.main-image-container');
    const mainImageUpload = document.getElementById('mainImageUpload');
    const thumbnails = document.querySelectorAll('.thumb');
    const thumbUploads = document.querySelectorAll('.thumb-container input[type="file"]');
    
    let mainImageFile = null;
    let thumbImageFiles = [null, null, null];

    // Initialize Jodit Rich Text Editor with more specific configuration
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
        buttonsSM: [
            'bold', 'italic', '|',
            'ul', 'ol', '|',
            'undo', 'redo'
        ],
        buttonsMobile: [
            'bold', 'italic', '|',
            'ul', 'ol', '|',
            'undo', 'redo'
        ],
        toolbarSticky: false, 
        toolbarAdaptive: true,
        placeholder: 'Enter product description with formatting...',
        removeButtons: ['about'],
        showTooltip: true,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        // Add explicit list plugin options
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
    
    async function uploadToTemp(file) {
        try {
            console.log('Starting upload for file:', file.name);
        
            const formData = new FormData();
            formData.append('image', file);
        
            console.log('Sending request to /api/upload-temp');
            const response = await fetch('/api/products/upload-temp', {
                method: 'POST',
                body: formData
            });
        
            console.log('Response status:', response.status);
        
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server responded with error:', errorText);
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }
        
            const data = await response.json();
            console.log('Upload successful, server response:', data);
            return data.tempPath;
        } catch (error) {
            console.error('Upload error details:', error);
            alert(`Failed to upload image: ${error.message}`);
            return null;
        }
    }
    
    // Set up image upload for main image
    mainImageContainer.addEventListener('click', function() {
        mainImageUpload.click();
    });
    
    mainImageUpload.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mainImageElement.src = e.target.result;
                mainImageElement.style.opacity = '0.5';
            };
            reader.readAsDataURL(file);
            
            // Then upload to temp location
            try {
                mainImageElement.style.opacity = '0.5';
                const tempPath = await uploadToTemp(file);
                if (tempPath) {
                    // Store the file for later form submission
                    mainImageFile = file;
                    // Update the preview with the temp image from server
                    mainImageElement.src = tempPath;
                    mainImageElement.style.opacity = '1'; // Restore opacity
                    console.log('Main image set to temp path:', tempPath);
                }
            } catch (error) {
                mainImageElement.style.opacity = '1'; // Restore opacity on error
                console.error('Error in temp upload:', error);
            }
        }
    });
    
    // Set up thumbnail uploads
    thumbUploads.forEach((upload, index) => {
        const thumbContainer = upload.closest('.thumb-container');
        const thumbPreview = thumbContainer.querySelector('.thumb');
        
        thumbContainer.addEventListener('click', function() {
            upload.click();
        });
        
        upload.addEventListener('change', async function(e) {
            const file = this.files[0];
            if (file) {
                // First, show the image locally for preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbPreview.src = e.target.result;
                    thumbPreview.style.opacity = '0.5'; // Dim the image to indicate loading
                };
                reader.readAsDataURL(file);
                
                // Then upload to temp location
                try {
                    thumbPreview.style.opacity = '0.5'; // Dim the image to indicate loading
                    const tempPath = await uploadToTemp(file);
                    if (tempPath) {
                        // Store the file for later form submission
                        thumbImageFiles[index] = file;
                        // Update the preview with the temp image from server
                        thumbPreview.src = tempPath;
                        thumbPreview.style.opacity = '1'; // Restore opacity
                        console.log(`Thumbnail ${index+1} set to temp path:`, tempPath);
                    }
                } catch (error) {
                    thumbPreview.style.opacity = '1'; // Restore opacity on error
                    console.error('Error in temp upload:', error);
                }
            }
        });
    });
    
    // Form submission
    addProductBtn.addEventListener('click', async () => {
        // Get form values using the correct IDs from your HTML
        const namaProduk = document.getElementById('product-name').value;
        const namaLatin = document.getElementById('latin-name').value;
        const hargaProduk = document.getElementById('price').value;
        const deskripsi = editor.value;
        const mainKategory = document.getElementById('mainCategory').value;
        const subKategory = document.getElementById('subCategory').value;

        // Validate form with updated fields
        if (!namaProduk || !hargaProduk || !mainKategory || !subKategory) {
            alert('Silakan lengkapi field yang wajib diisi!');
            return;
        }
        
        // Check if main image is selected
        if (!mainImageFile) {
            alert('Silakan pilih gambar utama produk!');
            return;
        }
        
        try {
            // Show loading state
            addProductBtn.disabled = true;
            addProductBtn.textContent = 'Menambahkan...';
            
            // Create FormData object to handle file uploads
            const formData = new FormData();
            formData.append('namaProduk', namaProduk);
            formData.append('namaLatin', namaLatin);
            formData.append('hargaProduk', hargaProduk);
            formData.append('deskripsi', deskripsi);
            formData.append('kategoriMain', mainKategory);
            formData.append('kategoriSub', subKategory);
            
            // Append images
            formData.append('gambarUtama', mainImageFile);
            
            // Append thumbnail images if they exist
            thumbImageFiles.forEach((file, index) => {
                if (file) {
                    const fieldName = ['gambarKedua', 'gambarKetiga', 'gambarKeempat'][index];
                    formData.append(fieldName, file);
                }
            });

            // Log form data (for debugging)
            console.log('Form data prepared:');
            for (const pair of formData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(`${pair[0]}: File - ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
                } else {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }
            }
            
            // Send the data to the server for final product creation
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add product');
            }
            
            const result = await response.json();
            alert('Produk berhasil ditambahkan!');
            
            // Redirect to dashboard or product list
            window.location.href = '/admin/admin-products';
            
        } catch (error) {
            console.error('Error submitting product:', error);
            alert(`Error: ${error.message}`);
            
            // Reset button state
            addProductBtn.disabled = false;
            addProductBtn.textContent = 'Add Product';
        }
    });
});