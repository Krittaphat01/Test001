// src/hooks/useWeather.js
import { useState, useEffect, useRef } from "react";
import { fetchWeather } from "../api/weather";
import { idbGet, idbSet, idbCleanupExpired } from "../lib/idb";

/**
 * useWeather - ดึงข้อมูลสภาพอากาศ (offline-first + IndexedDB caching)
 * -------------------------------------------------------------
 * ✅ โหลดจาก IndexedDB ก่อน (offline-first)
 * ✅ ถ้ามี cache สดกว่า staleTime → ใช้ cache ทันที แล้ว refresh พื้นหลัง
 * ✅ ถ้า cache เก่า → fetch network แล้วอัปเดต cache
 * ✅ มี retry (default 2 ครั้ง)
 * ✅ รีเฟรชข้อมูลทุก 30 นาที (client fallback)
 * ✅ ล้าง cache เก่าที่หมดอายุ (> 3 ชั่วโมง)
 *
 * @param {number} lat - ละติจูด
 * @param {number} lon - ลองจิจูด
 * @param {object} options
 * @param {number} options.staleTime - อายุ cache (มิลลิวินาที)
 * @param {number} options.retries - จำนวนครั้ง retry ถ้า fetch ล้มเหลว
 */
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

          // ✅ เก็บข้อมูลใน IndexedDB เพื่อใช้งาน offline
          await idbSet(key, normalized);

          return; // สำเร็จแล้วออกจาก loop
        } catch (e) {
          attempt++;
          if (attempt > retries) {
            if (!cancelled) setError(e);
            return;
          }
          // 🔁 exponential backoff
          await new Promise((r) => setTimeout(r, 300 * attempt));
        } finally {
          if (showLoading && !cancelled) setLoading(false);
        }
      }
    }

    (async () => {
      setLoading(true);
      try {
        // 🧹 ล้าง cache ที่หมดอายุ (> 3 ชม.)
        await idbCleanupExpired();

        // 1️⃣ โหลดจาก IndexedDB ก่อน (offline-first)
        const cached = await idbGet(key);

        if (cached) {
          console.log("✅ Loaded weather from cache:", key);
          if (!cancelled) setData(cached);

          // ตรวจสอบอายุ cache จาก idb.js (มันจะคืน null ถ้าเกินอายุ)
          // ดังนั้นไม่ต้องตรวจเองอีก
          // แต่เราจะยังคง refresh พื้นหลังเพื่อให้ข้อมูลใหม่
          fetchAndCache(false);
          setLoading(false);
          return;
        }

        // 2️⃣ ถ้าไม่มี cache → fetch จาก network
        await fetchAndCache(true);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // 3️⃣ รีเฟรชข้อมูลอัตโนมัติทุก 30 นาที
    const interval = setInterval(() => fetchAndCache(false), 30 * 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lat, lon, staleTime, retries]);

  return { data, loading, error };
}

/**
 * normalize - แปลงข้อมูลจาก API ให้มีโครงสร้างมาตรฐาน
 */
function normalize(res) {
  return {
    current: res.current || res.current_weather || {},
    hourly: res.hourly || { time: [], temperature_2m: [] },
    daily:
      res.daily || {
        time: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        precipitation_sum: [],
      },
    raw: res,
  };
}
