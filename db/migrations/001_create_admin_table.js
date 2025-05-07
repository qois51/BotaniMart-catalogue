module.exports = {
  up: async(db) => {
    await db.schema
        .createTable('admins')
        .addColumn('username', 'varchar(50)', (col) => col.primaryKey().unique())
        .addColumn('name', 'varchar(100)')
        .addColumn('email', 'varchar(100)', (col) => col.notNull().unique())
        .addColumn('password', 'varchar(255)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
        .execute();
  },
  down: async (db) => {
    await db.schema.dropTable('admins').execute();
  }
}