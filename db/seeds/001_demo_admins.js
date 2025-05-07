module.exports = {
  run: async (db) => {
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

    const result = await db
      .insertInto('admins')
      .values(adminData)
      .execute();

    console.log(`Seeded ${result.numInsertedOrUpdatedRows} admins`);
  }
};