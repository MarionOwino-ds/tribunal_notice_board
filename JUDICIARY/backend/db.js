const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let _db = null;

function save() {
  fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
}

function prepare(sql) {
  return {
    get(...params) {
      const stmt = _db.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all(...params) {
      const stmt = _db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    run(...params) {
      _db.run(sql, params);
      save();
      const res = _db.exec('SELECT last_insert_rowid()');
      return { lastInsertRowid: res[0]?.values[0][0] ?? null };
    }
  };
}

function exec(sql) {
  _db.run(sql);
  save();
}

function pragma(str) {
  _db.run(`PRAGMA ${str}`);
}

function transaction(fn) {
  return function(arg) {
    _db.run('BEGIN');
    try {
      fn(arg);
      _db.run('COMMIT');
      save();
    } catch (e) {
      _db.run('ROLLBACK');
      throw e;
    }
  };
}

const dbPromise = initSqlJs({}).then(SQL => {
  const fileBuffer = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : null;
  _db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

  if (!fileBuffer) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    _db.run(schema);
    save();
  }

  return { prepare, exec, pragma, transaction };
});

// Lazy proxy — routes call db.prepare() etc. after server awaits dbPromise
const db = new Proxy({}, {
  get(_, prop) {
    if (!_db) throw new Error('DB not ready. Await dbPromise before handling requests.');
    return { prepare, exec, pragma, transaction }[prop];
  }
});

module.exports = { dbPromise, db };
