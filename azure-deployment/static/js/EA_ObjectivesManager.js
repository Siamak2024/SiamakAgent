/**
 * EA_ObjectivesManager
 * 
 * Manages business objectives with CRUD operations and persistence
 * - Create, Read, Update, Delete operations
 * - Data validation and schema compliance
 * - Storage persistence (IndexedDB + localStorage fallback)
 * - Capability linking
 * - Workflow state tracking
 * 
 * Storage Strategy:
 * - Primary: IndexedDB object store 'businessObjectives'
 * - Fallback: localStorage with 'ea_objectives_' prefix
 * - Schema Version: 1.0
 */

const EA_ObjectivesManager = (function() {
  'use strict';

  // Constants
  const STORAGE_KEYS = {
    INDEXEDDB_NAME: 'EA_Platform',
    OBJECT_STORE_NAME: 'businessObjectives',
    LOCALSTORAGE_PREFIX: 'ea_objectives_',
    LOCALSTORAGE_INDEX: 'ea_objectives_index'
  };

  const VALID_PRIORITIES = ['high', 'medium', 'low'];
  
  const REQUIRED_FIELDS = ['id', 'name', 'description', 'priority', 'strategicTheme', 'outcomeStatement'];

  // State
  let storageType = null; // 'IndexedDB' or 'localStorage'
  let db = null;

  /**
   * Initialize storage (IndexedDB or localStorage fallback)
   */
  async function initializeStorage() {
    if (storageType) return; // Already initialized

    // Try IndexedDB first
    if (window.indexedDB) {
      try {
        db = await openIndexedDB();
        storageType = 'IndexedDB';
        console.log('✅ EA_ObjectivesManager: Using IndexedDB for persistence');
        return;
      } catch (error) {
        console.warn('⚠️ IndexedDB initialization failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    storageType = 'localStorage';
    console.log('✅ EA_ObjectivesManager: Using localStorage for persistence');
  }

  /**
   * Open IndexedDB connection
   */
  function openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_KEYS.INDEXEDDB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create businessObjectives object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORAGE_KEYS.OBJECT_STORE_NAME)) {
          const objectStore = db.createObjectStore(STORAGE_KEYS.OBJECT_STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('priority', 'priority', { unique: false });
          objectStore.createIndex('strategicTheme', 'strategicTheme', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Validate business objective data
   */
  function validateObjective(objective) {
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!objective[field] || (typeof objective[field] === 'string' && objective[field].trim() === '')) {
        throw new Error(`Validation error: ${field} is required and cannot be empty`);
      }
    }

    // Validate priority enum
    if (!VALID_PRIORITIES.includes(objective.priority)) {
      throw new Error(`Validation error: priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    // Validate data types
    if (typeof objective.name !== 'string') {
      throw new Error('Validation error: name must be a string');
    }

    if (typeof objective.description !== 'string') {
      throw new Error('Validation error: description must be a string');
    }

    if (typeof objective.strategicTheme !== 'string') {
      throw new Error('Validation error: strategicTheme must be a string');
    }

    if (typeof objective.outcomeStatement !== 'string') {
      throw new Error('Validation error: outcomeStatement must be a string');
    }

    // Validate linkedCapabilities is array if present
    if (objective.linkedCapabilities && !Array.isArray(objective.linkedCapabilities)) {
      throw new Error('Validation error: linkedCapabilities must be an array');
    }

    // Validate workflowState structure if present
    if (objective.workflowState) {
      if (typeof objective.workflowState.step1Complete !== 'boolean') {
        throw new Error('Validation error: workflowState.step1Complete must be boolean');
      }
      if (typeof objective.workflowState.step2Complete !== 'boolean') {
        throw new Error('Validation error: workflowState.step2Complete must be boolean');
      }
      if (typeof objective.workflowState.step3Complete !== 'boolean') {
        throw new Error('Validation error: workflowState.step3Complete must be boolean');
      }
      if (!Array.isArray(objective.workflowState.aiSessionHistory)) {
        throw new Error('Validation error: workflowState.aiSessionHistory must be an array');
      }
    }

    return true;
  }

  /**
   * Ensure objective has complete structure
   */
  function ensureCompleteStructure(objective) {
    const now = Date.now();

    return {
      ...objective,
      linkedCapabilities: objective.linkedCapabilities || [],
      createdAt: objective.createdAt || now,
      updatedAt: objective.updatedAt || now,
      workflowState: objective.workflowState || {
        step1Complete: false,
        step2Complete: false,
        step3Complete: false,
        aiSessionHistory: []
      }
    };
  }

  /**
   * Save to IndexedDB
   */
  async function saveToIndexedDB(objective) {
    if (!db) {
      db = await openIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_KEYS.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORAGE_KEYS.OBJECT_STORE_NAME);
      const request = objectStore.put(objective);

      request.onsuccess = () => resolve(objective);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get from IndexedDB
   */
  async function getFromIndexedDB(id) {
    if (!db) {
      db = await openIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_KEYS.OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORAGE_KEYS.OBJECT_STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all from IndexedDB
   */
  async function getAllFromIndexedDB() {
    if (!db) {
      db = await openIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_KEYS.OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORAGE_KEYS.OBJECT_STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete from IndexedDB
   */
  async function deleteFromIndexedDB(id) {
    if (!db) {
      db = await openIndexedDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_KEYS.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORAGE_KEYS.OBJECT_STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save to localStorage
   */
  function saveToLocalStorage(objective) {
    const key = STORAGE_KEYS.LOCALSTORAGE_PREFIX + objective.id;
    localStorage.setItem(key, JSON.stringify(objective));

    // Update index
    updateLocalStorageIndex(objective.id);

    return objective;
  }

  /**
   * Get from localStorage
   */
  function getFromLocalStorage(id) {
    const key = STORAGE_KEYS.LOCALSTORAGE_PREFIX + id;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Get all from localStorage
   */
  function getAllFromLocalStorage() {
    const index = getLocalStorageIndex();
    return index.map(id => getFromLocalStorage(id)).filter(obj => obj !== null);
  }

  /**
   * Delete from localStorage
   */
  function deleteFromLocalStorage(id) {
    const key = STORAGE_KEYS.LOCALSTORAGE_PREFIX + id;
    localStorage.removeItem(key);

    // Update index
    removeFromLocalStorageIndex(id);

    return true;
  }

  /**
   * Get localStorage index (list of all objective IDs)
   */
  function getLocalStorageIndex() {
    const indexData = localStorage.getItem(STORAGE_KEYS.LOCALSTORAGE_INDEX);
    return indexData ? JSON.parse(indexData) : [];
  }

  /**
   * Update localStorage index
   */
  function updateLocalStorageIndex(id) {
    const index = getLocalStorageIndex();
    if (!index.includes(id)) {
      index.push(id);
      localStorage.setItem(STORAGE_KEYS.LOCALSTORAGE_INDEX, JSON.stringify(index));
    }
  }

  /**
   * Remove from localStorage index
   */
  function removeFromLocalStorageIndex(id) {
    const index = getLocalStorageIndex();
    const newIndex = index.filter(existingId => existingId !== id);
    localStorage.setItem(STORAGE_KEYS.LOCALSTORAGE_INDEX, JSON.stringify(newIndex));
  }

  // ==================== PUBLIC API ====================

  /**
   * Create a new business objective
   */
  async function createObjective(objectiveData) {
    await initializeStorage();

    // Validate data
    validateObjective(objectiveData);

    // Ensure complete structure
    const objective = ensureCompleteStructure(objectiveData);

    // Save to storage
    if (storageType === 'IndexedDB') {
      return await saveToIndexedDB(objective);
    } else {
      return saveToLocalStorage(objective);
    }
  }

  /**
   * Get an objective by ID
   */
  async function getObjective(id) {
    await initializeStorage();

    if (storageType === 'IndexedDB') {
      return await getFromIndexedDB(id);
    } else {
      return getFromLocalStorage(id);
    }
  }

  /**
   * Update an existing objective
   */
  async function updateObjective(id, objectiveData) {
    await initializeStorage();

    // Check if objective exists
    const existing = await getObjective(id);
    if (!existing) {
      throw new Error(`Objective with ID ${id} not found`);
    }

    // Validate updated data
    validateObjective(objectiveData);

    // Ensure updatedAt timestamp
    const updated = {
      ...objectiveData,
      updatedAt: Date.now()
    };

    // Save to storage
    if (storageType === 'IndexedDB') {
      return await saveToIndexedDB(updated);
    } else {
      return saveToLocalStorage(updated);
    }
  }

  /**
   * Delete an objective
   */
  async function deleteObjective(id) {
    await initializeStorage();

    // Check if objective exists
    const existing = await getObjective(id);
    if (!existing) {
      throw new Error(`Objective with ID ${id} not found`);
    }

    // Delete from storage
    if (storageType === 'IndexedDB') {
      return await deleteFromIndexedDB(id);
    } else {
      return deleteFromLocalStorage(id);
    }
  }

  /**
   * List all objectives
   */
  async function listObjectives() {
    await initializeStorage();

    if (storageType === 'IndexedDB') {
      return await getAllFromIndexedDB();
    } else {
      return getAllFromLocalStorage();
    }
  }

  /**
   * Link capabilities to an objective
   */
  async function linkCapabilities(objectiveId, capabilityIds) {
    await initializeStorage();

    // Get existing objective
    const objective = await getObjective(objectiveId);
    if (!objective) {
      throw new Error(`Objective with ID ${objectiveId} not found`);
    }

    // Validate capabilityIds is array
    if (!Array.isArray(capabilityIds)) {
      throw new Error('capabilityIds must be an array');
    }

    // Update linkedCapabilities
    const updated = {
      ...objective,
      linkedCapabilities: capabilityIds,
      updatedAt: Date.now()
    };

    // Save to storage
    if (storageType === 'IndexedDB') {
      return await saveToIndexedDB(updated);
    } else {
      return saveToLocalStorage(updated);
    }
  }

  /**
   * Get capabilities linked to an objective
   */
  async function getLinkedCapabilities(objectiveId) {
    await initializeStorage();

    const objective = await getObjective(objectiveId);
    if (!objective) {
      throw new Error(`Objective with ID ${objectiveId} not found`);
    }

    return objective.linkedCapabilities || [];
  }

  /**
   * Get storage information
   */
  function getStorageInfo() {
    return {
      type: storageType || 'Not initialized',
      indexedDBAvailable: !!window.indexedDB,
      localStorageAvailable: !!window.localStorage
    };
  }

  /**
   * Clear all objectives (for testing/development)
   */
  async function clearAllObjectives() {
    await initializeStorage();

    if (storageType === 'IndexedDB') {
      if (!db) {
        db = await openIndexedDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORAGE_KEYS.OBJECT_STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORAGE_KEYS.OBJECT_STORE_NAME);
        const request = objectStore.clear();

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Clear localStorage
      const index = getLocalStorageIndex();
      index.forEach(id => {
        const key = STORAGE_KEYS.LOCALSTORAGE_PREFIX + id;
        localStorage.removeItem(key);
      });
      localStorage.removeItem(STORAGE_KEYS.LOCALSTORAGE_INDEX);
      return true;
    }
  }

  // Public API
  return {
    createObjective,
    getObjective,
    updateObjective,
    deleteObjective,
    listObjectives,
    linkCapabilities,
    getLinkedCapabilities,
    getStorageInfo,
    clearAllObjectives
  };
})();

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EA_ObjectivesManager;
}
