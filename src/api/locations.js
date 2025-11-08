import { apiFetch } from "./apiClient";
import { idbGet, idbSet } from "../lib/idb";

const STORE_KEY = "locations";

/**
 * ดึงรายการเมืองจาก IndexedDB หรือ mock API
 */
export async function fetchLocations(token) {
  // ✅ ถ้ามี backend จริง → เรียกผ่าน API ฝั่ง server
  try {
    const res = await apiFetch("/api/locations", { token });
    if (Array.isArray(res)) return res;
  } catch (e) {
  console.warn("Backend unavailable, using local cache...", e);
}

  // 🔄 fallback → IndexedDB mock
  const local = (await idbGet(STORE_KEY)) || [];
  return local;
}

/**
 * เพิ่มเมืองใหม่ (mock หรือ backend)
 */
export async function addLocation(location, token) {
  const { name, lat, lon, timezone } = location;

  if (!name || !lat || !lon)
    throw new Error("Missing required fields: name/lat/lon");

  try {
    // ✅ ถ้ามี backend จริง
    const res = await apiFetch("/api/locations", {
      method: "POST",
      body: { name, lat, lon, timezone },
      token,
    });
    return res;
  } catch (e) {
    console.warn("Backend unavailable, saving locally...", e);
  }

  // 🧩 fallback → เก็บใน IndexedDB
  const list = (await idbGet(STORE_KEY)) || [];
  const newItem = {
    id: Date.now(),
    name,
    lat,
    lon,
    timezone: timezone || "Asia/Bangkok",
  };

  list.push(newItem);
  await idbSet(STORE_KEY, list);

  return newItem;
}
