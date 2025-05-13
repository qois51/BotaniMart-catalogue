const PATHS = require('../../config/paths');
const { db } = require(PATHS.db);

async function queryProducts(id = null) {
    try {
        if (id !== null) {
            const product = await db
                .selectFrom('products')
                .selectAll()
                .where('id_product', '=', id)
                .executeTakeFirst();
            return product;
        } else {
            const products = await db
                .selectFrom('products')
                .selectAll()
                .execute();
            return products;
        }
    } catch (error) {
        console.error('Failed to query products:', error);
        process.exit(1);
    }
}

module.exports = { queryProducts };