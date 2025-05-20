const path = require('./config/paths');
const { Product } = require(path.db);

async function getAllProducts() {
  try {
    const products = await Product.findAll();
    console.log('Fetched products:', products.map(product => product.toJSON()));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

getAllProducts();