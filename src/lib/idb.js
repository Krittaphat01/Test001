// src/lib/idb.js
const DB_NAME = "weather-db";
const DB_VERSION = 5; // ✅ เพิ่ม version ใหม่ (เพิ่มได้เรื่อย ๆ)
const WEATHER_STORE = "weather";
const GEO_STORE = "geoCache";

/**
 * Open or upgrade IndexedDB safely.
 * - ถ้า DB schema เปลี่ยน → upgrade
 * - ถ้า version mismatch → ล้าง DB แล้วสร้างใหม่อัตโนมัติ
 */
function openDB() {
  return new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      console.warn("⚠️ IndexedDB open failed, resetting DB", e);
      indexedDB.deleteDatabase(DB_NAME);
      req = indexedDB.open(DB_NAME, DB_VERSION);
    }

    req.onupgradeneeded = () => {
      const db = req.result;
      console.log("🔧 Upgrading IndexedDB schema → version", DB_VERSION);
      if (!db.objectStoreNames.contains(WEATHER_STORE))
        db.createObjectStore(WEATHER_STORE, { keyPath: "key" });
      if (!db.objectStoreNames.contains(GEO_STORE))
        db.createObjectStore(GEO_STORE, { keyPath: "key" });
    };

    req.onsuccess = () => {
      const db = req.result;

      // ✅ ตรวจว่า store ครบไหม
      const requiredStores = [WEATHER_STORE, GEO_STORE];
      const missing = requiredStores.filter(
        (s) => !db.objectStoreNames.contains(s)
      );

      if (missing.length > 0) {
        console.warn("⚠️ Missing stores:", missing, "→ rebuilding DB");
        db.close();
        indexedDB.deleteDatabase(DB_NAME);
        const retry = indexedDB.open(DB_NAME, DB_VERSION);
        retry.onupgradeneeded = () => {
          const db2 = retry.result;
          requiredStores.forEach((s) =>
            db2.createObjectStore(s, { keyPath: "key" })
          );
        };
        retry.onsuccess = () => {
          console.log("✅ Recreated missing stores successfully");
          resolve(retry.result);
        };
        retry.onerror = () => reject(retry.error);
        return;
      }

      resolve(db);
    };

    req.onerror = () => {
      console.warn("❌ IndexedDB error:", req.error);
      // หากเปิดไม่ได้จริง → ล้างทิ้งแล้วเปิดใหม่
      indexedDB.deleteDatabase(DB_NAME);
      const retry = indexedDB.open(DB_NAME, DB_VERSION);
      retry.onupgradeneeded = () => {
        const db = retry.result;
        db.createObjectStore(WEATHER_STORE, { keyPath: "key" });
        db.createObjectStore(GEO_STORE, { keyPath: "key" });
      };
      retry.onsuccess = () => {
        console.log("✅ IndexedDB reset complete");
        resolve(retry.result);
      };
      retry.onerror = () => reject(retry.error);
    };
  });
}

/* ---------------- Weather Cache (เหมือนเดิม) ---------------- */
export async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WEATHER_STORE, "readonly");
      const store = tx.objectStore(WEATHER_STORE);
      const r = store.get(key);
      r.onsuccess = () => resolve(r.result ? r.result.value : null);
      r.onerror = () => reject(r.error);
    });
  } catch (e) {
    console.warn("idbGet error", e);
    return null;
  }
}

export async function idbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WEATHER_STORE, "readwrite");
      const store = tx.objectStore(WEATHER_STORE);
      const r = store.put({ key, value, updatedAt: Date.now() });
      r.onsuccess = () => resolve(true);
      r.onerror = () => reject(r.error);
    });
  } catch (e) {
    console.warn("idbSet error", e);
    return false;
  }
}

/* ---------------- Cleanup ---------------- */
export async function idbCleanupExpired(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
  const db = await openDB();
  const now = Date.now();

  const cleanup = (storeName) =>
    new Promise((resolve) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.openCursor();

      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (!cursor) return resolve();
        const record = cursor.value;
        if (now - (record.updatedAt || 0) > maxAgeMs) {
          store.delete(cursor.key);
        }
        cursor.continue();
      };
      req.onerror = () => resolve();
    });

  await Promise.all([cleanup(WEATHER_STORE), cleanup(GEO_STORE)]);
  console.log("🧹 IndexedDB cleanup complete");
}

/* ---------------- Geo Cache ---------------- */
export async function geoGet(lat, lon) {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(GEO_STORE, "readonly");
      const store = tx.objectStore(GEO_STORE);
      const r = store.get(key);
      r.onsuccess = () => resolve(r.result ? r.result.value : null);
      r.onerror = () => reject(r.error);
    });
  } catch (e) {
    console.warn("geoGet error", e);
    return null;
  }
}

export async function geoSet(lat, lon, value) {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(GEO_STORE, "readwrite");
      const store = tx.objectStore(GEO_STORE);
      const r = store.put({ key, value, updatedAt: Date.now() });
      r.onsuccess = () => resolve(true);
      r.onerror = () => reject(r.error);
    });
  } catch (e) {
    console.warn("geoSet error", e);
    return false;
  }
}
