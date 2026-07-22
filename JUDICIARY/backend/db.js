const { DatabaseSync } = require('node:sqlite');
const path             = require('path');
const fs               = require('fs');

const DB_PATH     = path.join(__dirname, 'database.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const isNew = !fs.existsSync(DB_PATH);

class DatabaseWrapper {
  constructor(dbPath) {
    this.db = new DatabaseSync(dbPath);
    this.isOpen = this.db.isOpen;
  }

  pragma(sql) {
    this.db.exec(`PRAGMA ${sql}`);
  }

  exec(sql) {
    this.db.exec(sql);
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }

  transaction(fn) {
    return (...args) => {
      this.db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this.db.exec('COMMIT');
        return result;
      } catch (err) {
        this.db.exec('ROLLBACK');
        throw err;
      }
    };
  }
}

const db = new DatabaseWrapper(DB_PATH);

// Performance pragmas
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Bootstrap schema on first run
if (isNew) {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
}

module.exports = db;

