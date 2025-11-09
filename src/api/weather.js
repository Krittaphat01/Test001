import { idbGet, idbSet } from "../lib/idb";

const API_BASE = "https://api.open-meteo.com/v1";


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
  console.log("Fetching weather:", url);

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();

      return normalizeWeatherResponse(json);
    } catch (err) {
      attempt++;
      console.warn(` fetchWeather attempt ${attempt} failed:`, err);
      if (attempt > retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}


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

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backfill failed: HTTP ${res.status}`);
  const json = await res.json();
  return normalizeWeatherResponse(json);
}


export async function getDailyData(
  lat,
  lon,
  timezone = "Asia/Bangkok",
  start,
  end,
  retries = 2
) {

  const rangeKey = start && end ? `:${start}_${end}` : "";
  const key = `weather:${lat}:${lon}${rangeKey}`;
  const MAX_AGE_MS = 3 * 60 * 60 * 1000; 

  try {
    const cached = await idbGet(key);
    if (cached?.daily && cached.updatedAt) {
      const age = Date.now() - cached.updatedAt;
      if (age < MAX_AGE_MS) {
        return cached.daily;
      }
    }

    let url =
      `${API_BASE}/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=${encodeURIComponent(timezone)}`;
    if (start && end) {
      url += `&start_date=${start}&end_date=${end}`;
    }

    let json = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
        break; 
      } catch (err) {
        console.warn(` Fetch attempt ${attempt + 1} failed:`, err);
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1))); 
      }
    }

    if (!json?.daily) throw new Error("Invalid response format");

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

    return normalized;
  } catch (err) {
    console.error(" getDailyData error:", err);

    const fallback = await idbGet(key);
    if (fallback?.daily) {
      console.warn(" Using fallback cached data (offline mode)");
      return fallback.daily;
    }

    return {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
    };
  }
}

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
