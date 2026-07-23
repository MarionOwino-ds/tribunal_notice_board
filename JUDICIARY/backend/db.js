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

function ensureColumn(tableName, columnName, definition) {
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = tableInfo.some(col => col.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
}

// Bootstrap schema and apply migrations for existing databases
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);
ensureColumn('resources', 'doc_type', 'doc_type TEXT');
ensureColumn('resources', 'status', "status TEXT NOT NULL DEFAULT 'pending'");
ensureColumn('resources', 'reject_reason', 'reject_reason TEXT');
ensureColumn('calendar_events', 'event_scope', "event_scope TEXT NOT NULL DEFAULT 'general'");
ensureColumn('calendar_events', 'department', 'department TEXT');
ensureColumn('calendar_events', 'created_by', 'created_by INTEGER REFERENCES users(id) ON DELETE SET NULL');

module.exports = db;

