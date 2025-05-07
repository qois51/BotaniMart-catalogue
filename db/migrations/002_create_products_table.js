// 002_create_products_table.js
module.exports = {
  up: async (db) => {
    await db.schema
      .createTable('products')
      .addColumn('id_product', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('product_name', 'text', (col) => col.notNull())
      .addColumn('product_price', 'text', (col) => col.notNull())
      .addColumn('product_desc', 'text')
      .addColumn('product_stock', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('product_picture', 'text')
      .addColumn('product_type', 'text', (col) => col.notNull())
      .addColumn('created_at', 'text', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
      .addColumn('updated_at', 'text', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
      .execute();
  },

  down: async (db) => {
    await db.schema.dropTable('products').execute();
  }
};