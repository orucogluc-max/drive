// Manual Jest mock for react-native-mmkv.
// MMKV is a native (Nitro) module with no JS implementation, so it cannot
// run under Node/Jest. This in-memory stand-in implements the handful of
// synchronous methods this codebase actually uses (set/getString/delete),
// matching the pattern react-native-mmkv's own docs recommend for testing.
class MMKV {
  constructor() {
    this._data = new Map();
  }
  set(key, value) {
    this._data.set(key, value);
  }
  getString(key) {
    return this._data.get(key);
  }
  getNumber(key) {
    return this._data.get(key);
  }
  getBoolean(key) {
    return this._data.get(key);
  }
  delete(key) {
    this._data.delete(key);
  }
  contains(key) {
    return this._data.has(key);
  }
  clearAll() {
    this._data.clear();
  }
}

module.exports = { MMKV };
