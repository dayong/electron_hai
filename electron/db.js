const Database = require('better-sqlite3');
const db = new Database('app.db');

// 初始化表
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )
`).run();

module.exports = db;

