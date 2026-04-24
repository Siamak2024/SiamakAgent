// Jest setup file - runs before all tests

// Mock localStorage for browser-based code
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock window.model for EA Platform
global.window = {
  model: {},
  localStorage: global.localStorage
};

// Add custom matchers if needed
expect.extend({
  toHaveProperty(received, property) {
    const pass = Object.prototype.hasOwnProperty.call(received, property);
    return {
      pass,
      message: () => pass
        ? `expected object not to have property "${property}"`
        : `expected object to have property "${property}"`
    };
  }
});
