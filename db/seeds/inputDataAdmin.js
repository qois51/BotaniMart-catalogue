const { db } = require('../db');

async function seedAdmins() {
    const adminData = [
        {
            username: 'john123',
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            username: 'smithJ',
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'yourpassword',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ];

    try {
        await db
            .insertInto('admins')
            .values(adminData)
            .execute();

        console.log('Admins seeded successfully!');
    } catch (error) {
        console.error('Failed to seed admins:', error);
        process.exit(1);
    } finally {
        db.destroy();
    }
}

seedAdmins();