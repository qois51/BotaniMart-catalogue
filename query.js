const { db } = require('./db/db');

async function queryAdmins() {
    try {
        const admins = await db.selectFrom('products').selectAll().execute();

        console.log('Admins:', admins);
    } catch (error) {
        console.error('Failed to query admins:', error);
        process.exit(1);
    } finally {
        db.destroy();
    }
}

queryAdmins();