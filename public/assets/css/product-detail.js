document.addEventListener('DOMContentLoaded', () => {
  const mainImg     = document.getElementById('main');
  const previewImgs = Array.from(document.querySelectorAll('.gambar-preview img'));
  let currentIndex  = 0;

  //Inisialisasi: tampilkan yang pertama
  if (previewImgs.length) {
    mainImg.src      = previewImgs[0].src;
    currentIndex     = 0;
  }

  //Fungsi untuk show image by index
  function showImage(idx) {
    if (idx < 0) idx = previewImgs.length - 1;
    if (idx >= previewImgs.length) idx = 0;
    currentIndex = idx;
    mainImg.src  = previewImgs[currentIndex].src;
  }

  //Klik thumbnail → ganti main
  previewImgs.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      showImage(idx);
    });
  });
});

// URL backend untuk mendapatkan data produk
const apiEndpoint = 'https://example.com/api/products/1'; // Ganti dengan URL API backend kamu

// Fungsi mengambil data produk dari backend
async function fetchProductData() {
  try {
    const response = await fetch(apiEndpoint);
    const productData = await response.json();
    updateProductDetails(productData);
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
  }
}

// Fungsi memperbarui konten halaman berdasarkan data produk
function updateProductDetails(data) {
  const mainImage = document.querySelector('.gambar-utama img');
  const previewContainer = document.querySelector('.gambar-preview');
  const titleElement = document.querySelector('.judul-produk h1');
  const categoryElement = document.querySelector('.judul-produk h2');
  const stockElement = document.querySelector('.stokdkk h2');
  const priceElement = document.querySelector('.harga');
  const descriptionElement = document.querySelector('.deskripsi');

  // Set gambar utama
  mainImage.src = data.mainImage;

  // Kosongkan dan isi ulang gambar preview
  previewContainer.innerHTML = '';
  data.previewImages.forEach((imgSrc) => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'Preview Image';

    img.addEventListener('click', () => {
      mainImage.src = imgSrc;
    });

    previewContainer.appendChild(img);
  });

  // Set informasi produk
  titleElement.textContent = data.name;
  categoryElement.textContent = data.category;
  stockElement.textContent = `Stok: ${data.stock} | Kategori: ${data.category} | Jenis: ${data.type || '-'}`;
  priceElement.textContent = `Rp${parseInt(data.price).toLocaleString('id-ID')},00`;
  descriptionElement.innerHTML = data.description;
}

// Jalankan saat halaman dimuat
window.addEventListener('DOMContentLoaded', fetchProductData);

