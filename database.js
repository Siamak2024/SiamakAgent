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
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createIndexOnUserId = `
    CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id)
  `;

  db.run(createModelsTable, (err) => {
    if (err) {
      console.error('Error creating models table:', err);
    } else {
      console.log('✓ Database tables ready');
      
      // Create index for faster user queries
      db.run(createIndexOnUserId, (err) => {
        if (err) {
          console.error('Error creating index:', err);
        } else {
          console.log('✓ Database indexes ready');
        }
      });
    }
  });
}

// Get all models for a specific user
function getAllModels(userId, callback) {
  const sql = 'SELECT id, name, created_at, updated_at FROM models WHERE user_id = ? ORDER BY updated_at DESC';
  db.all(sql, [userId], callback);
}

// Get a specific model by ID and user (ensures user owns the model)
function getModel(id, userId, callback) {
  const sql = 'SELECT * FROM models WHERE id = ? AND user_id = ?';
  db.get(sql, [id, userId], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (row) {
      // Parse the JSON data
      try {
        row.data = JSON.parse(row.data);
      } catch (parseError) {
        console.error('Error parsing model data:', parseError);
        callback(parseError, null);
        return;
      }
    }
    callback(null, row);
  });
}

// Save or update a model (with user ownership)
function saveModel(id, name, data, userId, callback) {
  const dataStr = JSON.stringify(data);

  if (id) {
    // Update existing model - verify ownership
    const sql = 'UPDATE models SET name = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    db.run(sql, [name, dataStr, id, userId], function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      // Check if row was actually updated (user owns the model)
      if (this.changes === 0) {
        callback(new Error('Model not found or access denied'), null);
        return;
      }
      callback(null, id);
    });
  } else {
    // Insert new model with user ownership
    const sql = 'INSERT INTO models (user_id, name, data) VALUES (?, ?, ?)';
    db.run(sql, [userId, name, dataStr], function(err) {
      callback(err, this.lastID);
    });
  }
}

// Delete a model (with user ownership check)
function deleteModel(id, userId, callback) {
  const sql = 'DELETE FROM models WHERE id = ? AND user_id = ?';
  db.run(sql, [id, userId], function(err) {
    if (err) {
      callback(err);
      return;
    }
    // Check if row was actually deleted (user owns the model)
    if (this.changes === 0) {
      callback(new Error('Model not found or access denied'));
      return;
    }
    callback(null);
  });
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
