// Manual Jest mock for react-native-mmkv.
// MMKV is a native (Nitro) module with no JS implementation, so it cannot
// run under Node/Jest. This in-memory stand-in implements the real
// createMMKV(config) factory API (see
// node_modules/react-native-mmkv/lib/specs/MMKV.nitro.d.ts) and the
// synchronous methods this codebase actually uses: set/getString/remove.
// Deliberately named `remove`, not `delete` — the real library has no
// `.delete()` method; using the wrong name here would silently mask the
// exact class of bug this mock exists to catch.
function createMMKV(_config) {
  const data = new Map();
  return {
    set(key, value) {
      data.set(key, value);
    },
    getString(key) {
      return data.get(key);
    },
    getNumber(key) {
      return data.get(key);
    },
    getBoolean(key) {
      return data.get(key);
    },
    remove(key) {
      return data.delete(key);
    },
    contains(key) {
      return data.has(key);
    },
    clearAll() {
      data.clear();
    },
  };
}

module.exports = { createMMKV };
