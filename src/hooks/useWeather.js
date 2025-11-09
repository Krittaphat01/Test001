
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWeather } from "../api/weather";
import { idbGet, idbSet, idbCleanupExpired } from "../lib/idb";

export function useWeather(lat, lon, { staleTime = 3 * 60 * 60 * 1000, retries = 2 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const keyRef = useRef(null);

  useEffect(() => {
    if (lat == null || lon == null) return;
    const key = `weather:${lat}:${lon}`;
    keyRef.current = key;

    let cancelled = false;

    async function fetchAndCache(showLoading = true) {
      if (showLoading) setLoading(true);

      let attempt = 0;
      while (attempt <= retries) {
        try {
          const res = await fetchWeather(lat, lon);
          const normalized = normalize(res);

          if (!cancelled) {
            setData(normalized);
            setError(null);
          }

          await idbSet(key, normalized);
          return;
        } catch (e) {
          attempt++;
          if (attempt > retries) {
            if (!cancelled) setError(e);
            return;
          }
          await new Promise((r) => setTimeout(r, 300 * attempt));
        } finally {
          if (showLoading && !cancelled) setLoading(false);
        }
      }
    }

    (async () => {
      setLoading(true);
      try {
        await idbCleanupExpired();
        const cached = await idbGet(key);
        const result = cached?.value || cached || null;

        if (result) {
          if (!cancelled) setData(result);
          fetchAndCache(false);
          setLoading(false);
          return;
        }

        await fetchAndCache(true);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // auto refresh ทุก 30 นาที
    const interval = setInterval(() => fetchAndCache(false), 30 * 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lat, lon, staleTime, retries]);

  const refreshWeather = useCallback(async () => {
    if (!lat || !lon) return;
    await idbSet(`weather:${lat}:${lon}`, null); 
    await new Promise((r) => setTimeout(r, 200)); 
    const res = await fetchWeather(lat, lon);
    const normalized = normalize(res);
    await idbSet(`weather:${lat}:${lon}`, normalized);
    setData(normalized);
  }, [lat, lon]);

  return { data, loading, error, refreshWeather };
}
function normalize(res) {
  return {
    current: res.current || {},
    hourly: res.hourly || {},
    daily: res.daily || {},
  };
}
