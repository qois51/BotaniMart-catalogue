const path = require('path');
const { Kysely, SqliteDialect } = require('kysely');
const Database = require('better-sqlite3');

const databasePath = path.resolve(__dirname, 'central.db');

const sqliteDatabase = new Database(databasePath, {
  fileMustExist: false,
});

const db = new Kysely({
  dialect: new SqliteDialect({
    database: sqliteDatabase,
  }),
});

module.exports = { db };