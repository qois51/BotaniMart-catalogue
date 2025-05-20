const PATHS = require('../../config/paths');
const { Product } = require(PATHS.db);

async function queryProducts(id = null) {
    try {
        let result;

        if (id !== null) {
            // Find a single product by id
            result = await Product.findByPk(id);
        } else {
            // Find all products
            result = await Product.findAll();
        }

        return result;
    } catch (error) {
        console.error('Failed to query products:', error);
        throw error; // Rethrow the error for handling by the caller
    }
}

module.exports = { queryProducts };