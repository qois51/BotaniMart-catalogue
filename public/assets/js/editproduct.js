document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('productForm');
  const updateProductBtn = document.querySelector('.add-product'); // sesuaikan dg class submit di HTML
  const deleteBtn = document.querySelector('.delete-btn');

  // Image elements
  const mainImageElement = document.getElementById('mainImagePreview');
  const mainImageUpload = document.getElementById('mainImageUpload');

  const thumbPreviews = [
    document.getElementById('thumb1Preview'),
    document.getElementById('thumb2Preview'),
    document.getElementById('thumb3Preview'),
  ];
  const thumbUploads = [
    document.getElementById('thumb1Upload'),
    document.getElementById('thumb2Upload'),
    document.getElementById('thumb3Upload'),
  ];

  // Container untuk menampilkan alert error di bawah judul-sub
  const judulSub = document.getElementById('judul-sub');
  let alertContainer = document.createElement('div');
  alertContainer.style.color = 'red';
  alertContainer.style.marginTop = '8px';
  judulSub.insertAdjacentElement('afterend', alertContainer);

  // Ambil id dari query param
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    alertContainer.textContent = 'Error: Parameter id tidak ditemukan di URL.';
    form.style.display = 'none';
    return;
  }

  // State file yang diupload (null jika belum diubah)
  let mainImageFile = null;
  let thumbImageFiles = [null, null, null];

  // Fungsi fetch produk
  async function fetchProduct(id) {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error(`Produk dengan id ${id} tidak ditemukan`);
      return await res.json();
    } catch (e) {
      throw e;
    }
  }

  // Fungsi reset gambar ke placeholder
  function resetImage(imgElement) {
    imgElement.src = '../uploads/placeholder.jpeg';
    imgElement.style.display = 'block';
  }

  // Fungsi upload gambar ke temp
  async function uploadToTemp(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/products/upload-temp', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload gagal: ${response.status} ${errText}`);
      }
      const data = await response.json();
      return data.tempPath;
    } catch (error) {
      alert(`Gagal upload gambar: ${error.message}`);
      return null;
    }
  }

  // Load data produk dan isi form
  try {
    const product = await fetchProduct(productId);

    document.getElementById('product-name').value = product.namaProduk || '';
    document.getElementById('latin-name').value = product.namaLatin || '';
    document.getElementById('stock').value = product.stockProduk || 0;
    document.getElementById('price').value = product.hargaProduk || 0;
    document.getElementById('description').value = product.deskripsi || '';
    document.getElementById('Specification').value = product.specification || '';
    document.getElementById('perawatan').value = product.caraPerawatan || '';
    document.getElementById('mainCategory').value = product.kategoriMain || '';
    document.getElementById('subCategory').value = product.kategoriSub || '';

    // Set gambar utama
    mainImageElement.src = `/uploads/products/${product.gambarUtama}`;
    mainImageFile = null;

    // Set thumbnails
    const thumbFilenames = [
      product.gambarKedua,
      product.gambarKetiga,
      product.gambarKeempat
    ];
    thumbFilenames.forEach((filename, i) => {
      if (filename) {
        thumbPreviews[i].src = `/uploads/products/${filename}`;
      } else {
        resetImage(thumbPreviews[i]);
      }
    });

  } catch (error) {
    alertContainer.textContent = `Error: ${error.message}`;
    form.style.display = 'none';
    return;
  }

  // Event klik di gambar utama untuk pilih file
  mainImageElement.addEventListener('click', () => mainImageUpload.click());
  // Klik overlay juga bisa kalau kamu mau tambahkan

  // Event upload gambar utama
  mainImageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview dulu
      const reader = new FileReader();
      reader.onload = e => {
        mainImageElement.src = e.target.result;
        mainImageElement.style.opacity = '0.5';
      };
      reader.readAsDataURL(file);

      const tempPath = await uploadToTemp(file);
      if (tempPath) {
        mainImageFile = file;
        mainImageElement.src = tempPath;
        mainImageElement.style.opacity = '1';
      } else {
        mainImageElement.style.opacity = '1';
      }
    }
  });

  // Event klik dan upload thumbnail
  thumbPreviews.forEach((img, i) => {
    img.addEventListener('click', () => thumbUploads[i].click());
  });

  thumbUploads.forEach((input, i) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          thumbPreviews[i].src = e.target.result;
          thumbPreviews[i].style.opacity = '0.5';
        };
        reader.readAsDataURL(file);

        const tempPath = await uploadToTemp(file);
        if (tempPath) {
          thumbImageFiles[i] = file;
          thumbPreviews[i].src = tempPath;
          thumbPreviews[i].style.opacity = '1';
        } else {
          thumbPreviews[i].style.opacity = '1';
        }
      }
    });
  });

  // Fungsi removeImage, juga perlu override tombol × yang sudah ada di HTML
  window.removeImage = function(button) {
    const container = button.parentElement;
    const img = container.querySelector('img');
    if (img) {
      if (confirm('Hapus gambar ini?')) {
        img.src = '../uploads/placeholder.jpeg';
        img.style.display = 'block';

        // Reset file terkait jika ini main image atau thumbnails
        if (img === mainImageElement) {
          mainImageFile = null;
          mainImageUpload.value = '';
        } else {
          thumbPreviews.forEach((thumbImg, i) => {
            if (thumbImg === img) {
              thumbImageFiles[i] = null;
              thumbUploads[i].value = '';
            }
          });
        }
      }
    }
  };

  // Handle form submit (update produk)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil value input
    const namaProduk = document.getElementById('product-name').value.trim();
    const namaLatin = document.getElementById('latin-name').value.trim();
    const stockProduk = document.getElementById('stock').value;
    const hargaProduk = document.getElementById('price').value;
    const deskripsi = document.getElementById('description').value.trim();
    const specification = document.getElementById('Specification').value.trim();
    const caraPerawatan = document.getElementById('perawatan').value.trim();
    const kategoriMain = document.getElementById('mainCategory').value.trim();
    const kategoriSub = document.getElementById('subCategory').value.trim();

    // Validasi sederhana
    if (!namaProduk || !hargaProduk || !stockProduk || !deskripsi || !kategoriMain || !kategoriSub) {
      alert('Harap lengkapi semua field wajib yang bertanda *');
      return;
    }

    if (!mainImageElement.src || mainImageElement.src.includes('placeholder.jpeg')) {
      alert('Silakan pilih gambar utama produk!');
      return;
    }

    try {
      updateProductBtn.disabled = true;
      updateProductBtn.textContent = 'Memperbarui...';

      const formData = new FormData();
      formData.append('namaProduk', namaProduk);
      formData.append('namaLatin', namaLatin);
      formData.append('stockProduk', stockProduk);
      formData.append('hargaProduk', hargaProduk);
      formData.append('deskripsi', deskripsi);
      formData.append('specification', specification);
      formData.append('caraPerawatan', caraPerawatan);
      formData.append('kategoriMain', kategoriMain);
      formData.append('kategoriSub', kategoriSub);

      // Upload file baru jika ada
      if (mainImageFile) {
        formData.append('gambarUtama', mainImageFile);
      }
      thumbImageFiles.forEach((file, i) => {
        if (file) {
          formData.append(`gambarKeduaKetigaKeempat${i + 1}`, file); 
          // pastikan backend bisa handle nama field ini
        }
      });

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal memperbarui produk');
      }

      alert('Produk berhasil diperbarui!');
      window.location.href = '/admin/admin-products';

    } catch (error) {
      alert(`Error: ${error.message}`);
      updateProductBtn.disabled = false;
      updateProductBtn.textContent = 'Finish Edit';
    }
  });

  // Handle delete button
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Apakah kamu yakin ingin menghapus produk ini?')) return;

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Menghapus...';

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus produk');
      }

      alert('Produk berhasil dihapus!');
      window.location.href = '/admin/admin-products';

    } catch (error) {
      alert(`Error: ${error.message}`);
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete Product';
    }
  });

});
