const PATHS = require('../../config/paths');
const { db } = require(PATHS.db);

async function queryProducts() {
    try {
        const product = await db.selectFrom('products').selectAll().execute();
        return product;
    } catch (error) {
        console.error('Failed to query products:', error);
        process.exit(1);
    } 
}

module.exports = { queryProducts };