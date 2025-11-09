import { apiFetch } from "./apiClient";
import { idbGet, idbSet } from "../lib/idb";

const STORE_KEY = "locations";


 
export async function fetchLocations(token) {

  try {
    const res = await apiFetch("/api/locations", { token });
    if (Array.isArray(res)) return res;
  } catch (e) {
  console.warn("Backend unavailable, using local cache...", e);
}

  const local = (await idbGet(STORE_KEY)) || [];
  return local;
}

export async function addLocation(location, token) {
  const { name, lat, lon, timezone } = location;

  if (!name || !lat || !lon)
    throw new Error("Missing required fields: name/lat/lon");

  try {
    const res = await apiFetch("/api/locations", {
      method: "POST",
      body: { name, lat, lon, timezone },
      token,
    });
    return res;
  } catch (e) {
    console.warn("Backend unavailable, saving locally...", e);
  }

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
