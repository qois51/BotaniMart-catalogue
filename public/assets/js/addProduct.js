document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addProductForm');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const mainImagePreview = document.querySelector('.main-image-container .image-preview img') ||
                             document.querySelector('#mainImagePreview img');
    const mainImageUpload = document.getElementById('mainImageUpload');
    const thumbContainers = document.querySelectorAll('.thumb-container');
    const thumbUploads = document.querySelectorAll('.thumb-upload');
    const thumbPreviews = document.querySelectorAll('.thumb-container .thumb img');

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
    
    // Main image upload
    document.querySelector('.main-image-container .image-preview').addEventListener('click', function() {
        mainImageUpload.click();
    });

    mainImageUpload.addEventListener('change', async function(e) {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                mainImagePreview.src = e.target.result;
                mainImagePreview.style.opacity = '0.5';
            };
            reader.readAsDataURL(file);

            try {
                mainImagePreview.style.opacity = '0.5';
                const tempPath = await uploadToTemp(file);
                if (tempPath) {
                    mainImageFile = file;
                    mainImagePreview.src = tempPath;
                    mainImagePreview.style.opacity = '1';
                }
            } catch (error) {
                mainImagePreview.style.opacity = '1';
                console.error('Error in temp upload:', error);
            }
        }
    });

    // Thumbnail uploads
    thumbContainers.forEach((container, index) => {
        const thumbPreview = container.querySelector('.thumb img');
        const thumbUpload = container.querySelector('.thumb-upload');
        container.querySelector('.image-preview').addEventListener('click', function() {
            thumbUpload.click();
        });
        thumbUpload.addEventListener('change', async function(e) {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    thumbPreview.src = e.target.result;
                    thumbPreview.style.opacity = '0.5';
                };
                reader.readAsDataURL(file);

                try {
                    thumbPreview.style.opacity = '0.5';
                    const tempPath = await uploadToTemp(file);
                    if (tempPath) {
                        thumbImageFiles[index] = file;
                        thumbPreview.src = tempPath;
                        thumbPreview.style.opacity = '1';
                    }
                } catch (error) {
                    thumbPreview.style.opacity = '1';
                    console.error('Error in temp upload:', error);
                }
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const namaProduk = document.getElementById('product-name').value;
        const namaLatin = document.getElementById('latin-name').value;
        const hargaProduk = document.getElementById('price').value;
        const deskripsi = editor.value;
        const mainKategory = document.getElementById('mainCategory').value;
        const subKategory = document.getElementById('subCategory').value;

        if (!namaProduk || !hargaProduk || !mainKategory) {
            alert('Silakan lengkapi field yang wajib diisi!');
            return;
        }
        if (!mainImageFile) {
            alert('Silakan pilih gambar utama produk!');
            return;
        }

        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Menambahkan...';

            const formData = new FormData();
            formData.append('namaProduk', namaProduk);
            formData.append('namaLatin', namaLatin);
            formData.append('hargaProduk', hargaProduk);
            formData.append('deskripsi', deskripsi);
            formData.append('kategoriMain', mainKategory);
            formData.append('kategoriSub', subKategory);
            formData.append('gambarUtama', mainImageFile);

            thumbImageFiles.forEach((file, index) => {
                if (file) {
                    const fieldName = ['gambarKedua', 'gambarKetiga', 'gambarKeempat'][index];
                    formData.append(fieldName, file);
                }
            });

            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add product');
            }

            alert('Produk berhasil ditambahkan!');
            window.location.href = '/admin/admin-products';

        } catch (error) {
            console.error('Error submitting product:', error);
            alert(`Error: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Add Product';
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', function() {
        window.location.href = '/admin/admin-products';
    });
});