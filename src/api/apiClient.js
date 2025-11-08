/**
 * src/api/apiClient.js
 * --------------------
 * ฟังก์ชันกลางสำหรับเรียก API ฝั่ง Backend
 * รองรับ token, retry, และ error-handling
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // เช่น "https://api.example.com"

/**
 * เรียก API โดยแนบ token (ถ้ามี)
 * @param {string} endpoint เช่น "/api/locations"
 * @param {object} options method, body, headers, token, retries
 */
export async function apiFetch(
  endpoint,
  { method = "GET", body = null, headers = {}, token = null, retries = 1 } = {}
) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const finalHeaders = new Headers(headers);
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  if (body && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const opts = {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : null,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);

      if (res.status === 401) {
        console.warn("Unauthorized — token expired or invalid.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
        err.status = res.status;
        throw err;
      }

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (e) {
      if (attempt === retries) throw e;

      const delay = 500 * Math.pow(2, attempt);
      console.warn(`Retrying ${url} in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
