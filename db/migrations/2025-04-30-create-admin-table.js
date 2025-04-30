const { db } = require('../db');

async function createTableAdmin() {
    const tableExists = await db
        .selectFrom('sqlite_master')
        .select('name')
        .where('type', '=', 'table')
        .where('name', '=', 'admins')
        .executeTakeFirst();

    if (tableExists) {
        console.log('Table `admins` already exists. Skipping creation.');
        return;
    }

    await db.schema
        .createTable('admins')
        .addColumn('username', 'varchar(50)', (col) => col.primaryKey().unique())
        .addColumn('name', 'varchar(100)')
        .addColumn('email', 'varchar(100)', (col) => col.notNull().unique())
        .addColumn('password', 'varchar(255)', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
        .execute();

    console.log('Table `admins` created.');
}

createTableAdmin().catch((err) => {
    console.error('Failed to setup database:', err);
    process.exit(1);
});