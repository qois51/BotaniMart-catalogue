document.addEventListener('DOMContentLoaded', () => {
  fetchProductData();
});

async function fetchProductData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    console.error("ID produk tidak ditemukan di URL.");
    return;
  }

  try {
    const response = await fetch(`/products?id=${id}`);
    const data = await response.json();

    updateProductDetails({
      name: data.product_name,
      price: data.product_price,
      description: data.product_desc,
      stock: data.product_stock,
      category: data.product_type,
      picture: data.product_picture,
    });
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
  }
}

function updateProductDetails(data) {
  const mainImage = document.getElementById('main-image');
  const titleElement = document.getElementById('product-name');
  const typeElement = document.getElementById('product-type');
  const stockElement = document.getElementById('stok-info');
  const priceElement = document.getElementById('product-price');
  const descriptionElement = document.getElementById('product-desc');

  mainImage.src = data.picture;
  titleElement.textContent = data.name;
  typeElement.textContent = data.category;
  stockElement.textContent = `Stok: ${data.stock} | Kategori: ${data.category}`;
  priceElement.textContent = `Rp${parseInt(data.price).toLocaleString('id-ID')},00`;
  descriptionElement.textContent = data.description;
}