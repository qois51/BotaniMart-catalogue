const fs = require('fs');
const path = require('path');
const { Kysely } = require('kysely');
const { db } = require('./db');

class MiniMigrator {
  constructor(db) {
    this.db = db;
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.seedsDir = path.join(__dirname, 'seeds');
  }

  // Main migration runner
  async migrate(target = 'latest') {
    await this._ensureMigrationsTable();
    const executed = await this._getExecutedMigrations();
    const files = this._getMigrationFiles();

    if (target === 'latest') {
      for (const file of files) {
        if (!executed.includes(file)) {
          await this._runMigration(file, 'up');
        }
      }
    } else if (target === 'rollback') {
      const lastFile = executed.pop();
      if (lastFile) await this._runMigration(lastFile, 'down');
    }
  }

  // Seed runner
  async seed() {
    const files = fs.readdirSync(this.seedsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    for (const file of files) {
      console.log(`Seeding: ${file}`);
      const seed = require(path.join(this.seedsDir, file));
      await seed.run(this.db);
    }
  }

  // --- Internal Methods ---
  async _runMigration(name, direction) {
    const migration = require(path.join(this.migrationsDir, name));
    console.log(`${direction === 'up' ? 'Running' : 'Reverting'}: ${name}`);
    await migration[direction](this.db);
    
    if (direction === 'up') {
      await this.db.insertInto('_migrations').values({ name }).execute();
    } else {
      await this.db.deleteFrom('_migrations').where('name', '=', name).execute();
    }
  }

  _getMigrationFiles() {
    return fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();
  }

  async _ensureMigrationsTable() {
    const result = await this.db
        .selectFrom('sqlite_master')
        .select('name')
        .where('type', '=', 'table')
        .where('name', '=', '_migrations')
        .execute();

    if (result.length === 0) {
        await this.db.schema
        .createTable('_migrations')
        .addColumn('name', 'text', col => col.primaryKey())
        .execute();
    }
  }

  async _getExecutedMigrations() {
    const rows = await this.db
      .selectFrom('_migrations')
      .select('name')
      .execute();
    return rows.map(r => r.name);
  }
}

const [,, command, arg] = process.argv;
const migrator = new MiniMigrator(db);

(async () => {
  switch (command) {
    case 'migrate':
      await migrator.migrate(arg);
      break;
    case 'seed':
      await migrator.seed();
      break;
    default:
      console.log('Usage: node migrate.js [migrate|seed] [latest|rollback]');
  }
  await db.destroy();
})().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});