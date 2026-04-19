/**
 * EA_StorageManager.js
 * IndexedDB wrapper with localStorage fallback for Decision Engine & Engagement Playbook
 * Manages core entities: Applications, Decisions, Scores, Engagements, Stakeholders, etc.
 * 
 * @version 1.1
 * @date 2026-04-17
 */

class EA_StorageManager {
  constructor() {
    this.dbName = 'EA_DecisionEngine';
    this.dbVersion = 2;  // Incremented for new stores
    this.db = null;
    this.useLocalStorage = false;
    this.stores = [
      'applications', 
      'decisions', 
      'scores', 
      'optimizationCandidates', 
      'transformationInitiatives',
      // New stores for Engagement Playbook
      'engagements',
      'stakeholders',
      'capabilities',
      'initiatives',
      'roadmapItems',
      'risks',
      'constraints',
      'assumptions',
      'artifacts',
      'generationHistory'
    ];
  }

  /**
   * Initialize storage (IndexedDB or fallback to localStorage)
   * @returns {Promise<boolean>}
   */
  async init() {
    // Check IndexedDB support
    if (!window.indexedDB) {
      console.warn('⚠️ IndexedDB not supported. Falling back to localStorage.');
      this.useLocalStorage = true;
      this.initLocalStorage();
      return true;
    }

    try {
      await this.initIndexedDB();
      console.log('✅ EA_StorageManager initialized with IndexedDB');
      return true;
    } catch (error) {
      console.error('❌ IndexedDB initialization failed:', error);
      console.warn('⚠️ Falling back to localStorage');
      this.useLocalStorage = true;
      this.initLocalStorage();
      return true;
    }
  }

  /**
   * Initialize IndexedDB database
   * @returns {Promise<void>}
   */
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('applications')) {
          const appStore = db.createObjectStore('applications', { keyPath: 'id' });
          appStore.createIndex('lifecycle', 'lifecycle', { unique: false });
          appStore.createIndex('department', 'department', { unique: false });
          appStore.createIndex('engagementId', 'engagementId', { unique: false });
        }

        if (!db.objectStoreNames.contains('decisions')) {
          const decisionStore = db.createObjectStore('decisions', { keyPath: 'id' });
          decisionStore.createIndex('appId', 'appId', { unique: false });
          decisionStore.createIndex('status', 'status', { unique: false });
          decisionStore.createIndex('approvalStatus', 'approvalStatus', { unique: false });
          decisionStore.createIndex('engagementId', 'engagementId', { unique: false });
        }

        if (!db.objectStoreNames.contains('scores')) {
          const scoreStore = db.createObjectStore('scores', { keyPath: 'appId' });
          scoreStore.createIndex('total', 'total', { unique: false });
        }

        if (!db.objectStoreNames.contains('optimizationCandidates')) {
          const optStore = db.createObjectStore('optimizationCandidates', { keyPath: 'id' });
          optStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('transformationInitiatives')) {
          const transStore = db.createObjectStore('transformationInitiatives', { keyPath: 'id' });
          transStore.createIndex('type', 'type', { unique: false });
          transStore.createIndex('status', 'status', { unique: false });
        }

        // New stores for Engagement Playbook
        if (!db.objectStoreNames.contains('engagements')) {
          const engStore = db.createObjectStore('engagements', { keyPath: 'id' });
          engStore.createIndex('segment', 'segment', { unique: false });
          engStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('stakeholders')) {
          const stakeStore = db.createObjectStore('stakeholders', { keyPath: 'id' });
          stakeStore.createIndex('engagementId', 'engagementId', { unique: false });
          stakeStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains('capabilities')) {
          const capStore = db.createObjectStore('capabilities', { keyPath: 'id' });
          capStore.createIndex('engagementId', 'engagementId', { unique: false });
          capStore.createIndex('domain', 'domain', { unique: false });
        }

        if (!db.objectStoreNames.contains('initiatives')) {
          const initStore = db.createObjectStore('initiatives', { keyPath: 'id' });
          initStore.createIndex('engagementId', 'engagementId', { unique: false });
          initStore.createIndex('timeHorizon', 'timeHorizon', { unique: false });
        }

        if (!db.objectStoreNames.contains('roadmapItems')) {
          const roadmapStore = db.createObjectStore('roadmapItems', { keyPath: 'id' });
          roadmapStore.createIndex('engagementId', 'engagementId', { unique: false });
        }

        if (!db.objectStoreNames.contains('risks')) {
          const riskStore = db.createObjectStore('risks', { keyPath: 'id' });
          riskStore.createIndex('engagementId', 'engagementId', { unique: false });
          riskStore.createIndex('likelihood', 'likelihood', { unique: false });
        }

        if (!db.objectStoreNames.contains('constraints')) {
          const constraintStore = db.createObjectStore('constraints', { keyPath: 'id' });
          constraintStore.createIndex('engagementId', 'engagementId', { unique: false });
        }

        if (!db.objectStoreNames.contains('assumptions')) {
          const assumptionStore = db.createObjectStore('assumptions', { keyPath: 'id' });
          assumptionStore.createIndex('engagementId', 'engagementId', { unique: false });
        }

        if (!db.objectStoreNames.contains('artifacts')) {
          const artifactStore = db.createObjectStore('artifacts', { keyPath: 'id' });
          artifactStore.createIndex('engagementId', 'engagementId', { unique: false });
          artifactStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('generationHistory')) {
          const histStore = db.createObjectStore('generationHistory', { keyPath: 'id' });
          histStore.createIndex('engagementId', 'engagementId', { unique: false });
        }
      };
    });
  }

  /**
   * Initialize localStorage fallback
   */
  initLocalStorage() {
    // Ensure each store has an array in localStorage
    this.stores.forEach(store => {
      const key = `ea_de_${store}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Add or update item in store
   * @param {string} storeName - Store name
   * @param {object} item - Item to save
   * @returns {Promise<void>}
   */
  async save(storeName, item) {
    if (this.useLocalStorage) {
      return this.saveToLocalStorage(storeName, item);
    }
    return this.saveToIndexedDB(storeName, item);
  }

  /**
   * Get item by ID
   * @param {string} storeName - Store name
   * @param {string} id - Item ID
   * @returns {Promise<object|null>}
   */
  async get(storeName, id) {
    if (this.useLocalStorage) {
      return this.getFromLocalStorage(storeName, id);
    }
    return this.getFromIndexedDB(storeName, id);
  }

  /**
   * Get all items from store
   * @param {string} storeName - Store name
   * @returns {Promise<Array>}
   */
  async getAll(storeName) {
    if (this.useLocalStorage) {
      return this.getAllFromLocalStorage(storeName);
    }
    return this.getAllFromIndexedDB(storeName);
  }

  /**
   * Delete item by ID
   * @param {string} storeName - Store name
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    if (this.useLocalStorage) {
      return this.deleteFromLocalStorage(storeName, id);
    }
    return this.deleteFromIndexedDB(storeName, id);
  }

  /**
   * Query items by index
   * @param {string} storeName - Store name
   * @param {string} indexName - Index name
   * @param {any} value - Value to match
   * @returns {Promise<Array>}
   */
  async query(storeName, indexName, value) {
    if (this.useLocalStorage) {
      return this.queryFromLocalStorage(storeName, indexName, value);
    }
    return this.queryFromIndexedDB(storeName, indexName, value);
  }

  // ═══════════════════════════════════════════════════════════════
  // IndexedDB IMPLEMENTATIONS
  // ═══════════════════════════════════════════════════════════════

  saveToIndexedDB(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getFromIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  getAllFromIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  deleteFromIndexedDB(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  queryFromIndexedDB(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // localStorage IMPLEMENTATIONS
  // ═══════════════════════════════════════════════════════════════

  saveToLocalStorage(storeName, item) {
    const key = `ea_de_${storeName}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const index = items.findIndex(i => i.id === item.id);

    if (index >= 0) {
      items[index] = item; // Update
    } else {
      items.push(item); // Create
    }

    localStorage.setItem(key, JSON.stringify(items));
    return Promise.resolve();
  }

  getFromLocalStorage(storeName, id) {
    const key = `ea_de_${storeName}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const item = items.find(i => i.id === id);
    return Promise.resolve(item || null);
  }

  getAllFromLocalStorage(storeName) {
    const key = `ea_de_${storeName}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    return Promise.resolve(items);
  }

  deleteFromLocalStorage(storeName, id) {
    const key = `ea_de_${storeName}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return Promise.resolve();
  }

  queryFromLocalStorage(storeName, indexName, value) {
    const key = `ea_de_${storeName}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = items.filter(i => i[indexName] === value);
    return Promise.resolve(filtered);
  }

  // ═══════════════════════════════════════════════════════════════
  // DATA MIGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Migrate existing APM data to Decision Engine format
   * @returns {Promise<{migrated: number, skipped: number}>}
   */
  async migrateFromAPM() {
    console.log('🔄 Starting APM data migration...');

    try {
      // Find existing APM data in localStorage
      const apmKeys = Object.keys(localStorage).filter(key => key.startsWith('apm_applications'));
      let migrated = 0;
      let skipped = 0;

      for (const key of apmKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          
          if (Array.isArray(data)) {
            // Migrate applications
            for (const app of data) {
              await this.save('applications', app);
              migrated++;
            }
          } else if (data && typeof data === 'object') {
            // Single application object
            await this.save('applications', data);
            migrated++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to migrate ${key}:`, error);
          skipped++;
        }
      }

      console.log(`✅ Migration complete: ${migrated} applications migrated, ${skipped} skipped`);
      return { migrated, skipped };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { migrated: 0, skipped: 0 };
    }
  }

  /**
   * Create backup of current data
   * @returns {Promise<string>} - Backup JSON string
   */
  async createBackup() {
    const backup = {
      timestamp: new Date().toISOString(),
      version: this.dbVersion,
      data: {}
    };

    for (const store of this.stores) {
      backup.data[store] = await this.getAll(store);
    }

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restore from backup
   * @param {string} backupJson - Backup JSON string
   * @returns {Promise<boolean>}
   */
  async restoreFromBackup(backupJson) {
    try {
      const backup = JSON.parse(backupJson);

      for (const store of this.stores) {
        if (backup.data[store]) {
          for (const item of backup.data[store]) {
            await this.save(store, item);
          }
        }
      }

      console.log('✅ Backup restored successfully');
      return true;
    } catch (error) {
      console.error('❌ Backup restore failed:', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Clear all data from store
   * @param {string} storeName - Store name
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    if (this.useLocalStorage) {
      localStorage.setItem(`ea_de_${storeName}`, JSON.stringify([]));
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage statistics
   * @returns {Promise<object>}
   */
  async getStats() {
    const stats = {
      storageType: this.useLocalStorage ? 'localStorage' : 'IndexedDB',
      stores: {}
    };

    for (const store of this.stores) {
      const items = await this.getAll(store);
      stats.stores[store] = {
        count: items.length,
        size: JSON.stringify(items).length
      };
    }

    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_StorageManager;
}
