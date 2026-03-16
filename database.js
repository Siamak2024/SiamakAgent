const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'ea_models.db');
let db;

// Initialize database and create tables
function init() {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }
    console.log('✓ Database connected:', DB_PATH);
    createTables();
  });
}

// Create tables if they don't exist
function createTables() {
  const createModelsTable = `
    CREATE TABLE IF NOT EXISTS models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createModelsTable, (err) => {
    if (err) {
      console.error('Error creating models table:', err);
    } else {
      console.log('✓ Database tables ready');
    }
  });
}

// Get all models
function getAllModels(callback) {
  const sql = 'SELECT id, name, created_at, updated_at FROM models ORDER BY updated_at DESC';
  db.all(sql, [], callback);
}

// Get a specific model by ID
function getModel(id, callback) {
  const sql = 'SELECT * FROM models WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (row) {
      // Parse the JSON data
      row.data = JSON.parse(row.data);
    }
    callback(null, row);
  });
}

// Save or update a model
function saveModel(id, name, data, callback) {
  const dataStr = JSON.stringify(data);

  if (id) {
    // Update existing model
    const sql = 'UPDATE models SET name = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, [name, dataStr, id], function(err) {
      callback(err, id);
    });
  } else {
    // Insert new model
    const sql = 'INSERT INTO models (name, data) VALUES (?, ?)';
    db.run(sql, [name, dataStr], function(err) {
      callback(err, this.lastID);
    });
  }
}

// Delete a model
function deleteModel(id, callback) {
  const sql = 'DELETE FROM models WHERE id = ?';
  db.run(sql, [id], callback);
}

// Close database connection
function close() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('✓ Database connection closed');
      }
    });
  }
}

module.exports = {
  init,
  getAllModels,
  getModel,
  saveModel,
  deleteModel,
  close
};
