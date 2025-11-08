// src/api/weather.js
import { idbGet, idbSet } from "../lib/idb";

const API_BASE = "https://api.open-meteo.com/v1";

// ✅ ดึงข้อมูลสภาพอากาศหลัก
export async function fetchWeather(lat, lon, timezone = "Asia/Bangkok", retries = 2) {
  if (!lat || !lon) throw new Error("Missing latitude/longitude");

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: timezone || "Asia/Bangkok",
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation",
    hourly: "temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
  });

  const url = `${API_BASE}/forecast?${params.toString()}`;
  console.log("🌦️ Fetching weather:", url);

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();

      return normalizeWeatherResponse(json);
    } catch (err) {
      attempt++;
      console.warn(`🌧️ fetchWeather attempt ${attempt} failed:`, err);
      if (attempt > retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

// ✅ ดึงข้อมูลย้อนหลัง (Backfill)
export async function fetchWeatherBackfill(lat, lon, timezone = "Asia/Bangkok", days = 3) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - days);

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone,
    start_date: startStr,
    end_date: endStr,
    hourly: "temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
  });

  const url = `${API_BASE}/forecast?${params.toString()}`;
  console.log("⏪ Fetching backfill:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backfill failed: HTTP ${res.status}`);
  const json = await res.json();
  return normalizeWeatherResponse(json);
}

// ✅ ใช้ใน CompareModal (IndexedDB offline-first)
export async function getDailyData(lat, lon, timezone = "Asia/Bangkok") {
  const key = `weather:${lat}:${lon}`;
  const MAX_AGE_MS = 3 * 60 * 60 * 1000;

  try {
    const cached = await idbGet(key);
    if (cached?.daily && cached.updatedAt) {
      const age = Date.now() - cached.updatedAt;
      if (age < MAX_AGE_MS) {
        console.log("✅ Using cached daily data:", key);
        return cached.daily;
      }
    }

    const url =
      `${API_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=${timezone}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch daily data");
    const json = await res.json();

    const normalized = {
      time: json.daily?.time || [],
      temperature_2m_max: json.daily?.temperature_2m_max || [],
      temperature_2m_min: json.daily?.temperature_2m_min || [],
      precipitation_sum: json.daily?.precipitation_sum || [],
    };

    await idbSet(key, {
      ...(cached || {}),
      daily: normalized,
      updatedAt: Date.now(),
    });

    console.log("💾 Cached new daily data:", key);
    return normalized;
  } catch (err) {
    console.error("❌ getDailyData error:", err);
    return {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
    };
  }
}

// ✅ Normalizer shared
function normalizeWeatherResponse(res) {
  return {
    current: res.current || res.current_weather || {},
    hourly: res.hourly || { time: [], temperature_2m: [] },
    daily: res.daily || {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
    },
    raw: res,
  };
}
