const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'magicui.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create monitors table
      db.run(`
        CREATE TABLE IF NOT EXISTS monitors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_url TEXT NOT NULL,
          scraper_code TEXT,
          status TEXT DEFAULT 'Pending',
          last_checked DATETIME,
          last_action TEXT,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (email)
        )
      `);

      // Create ai_fixes table
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_fixes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          monitor_id INTEGER NOT NULL,
          original_code TEXT NOT NULL,
          fixed_code TEXT NOT NULL,
          explanation TEXT,
          status TEXT DEFAULT 'Pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (monitor_id) REFERENCES monitors (id)
        )
      `);

      // Create monitor_logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS monitor_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          monitor_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          message TEXT,
          execution_time INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (monitor_id) REFERENCES monitors (id)
        )
      `);

      // Create default admin user if not exists
      db.get("SELECT * FROM users WHERE email = 'admin@magicui.com'", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 10);
          
          db.run(`
            INSERT INTO users (email, password, name) 
            VALUES (?, ?, ?)
          `, ['admin@magicui.com', hashedPassword, 'Admin User'], (err) => {
            if (err) {
              reject(err);
            } else {
              console.log('Default admin user created: admin@magicui.com / admin123');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
}; 