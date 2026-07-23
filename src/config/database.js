const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
  if (db) return db;

  const dbPath = path.resolve(__dirname, '../../chave_mestra.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Configurações de performance e chaves estrangeiras
  await db.exec('PRAGMA journal_mode = WAL;');
  await db.exec('PRAGMA foreign_keys = ON;');

  // Criação da estrutura de tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      current_challenge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authenticators (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      public_key BLOB NOT NULL,
      counter INTEGER NOT NULL,
      transports TEXT,
      device_type TEXT,
      backed_up INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
}

module.exports = { initDb };