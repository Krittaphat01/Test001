import { useState, useCallback } from "react";
import { AuthContext } from "./AuthContextValue";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  /**
   * authFetch — ดึงข้อมูลจาก API พร้อมแนบ Authorization header
   * ใช้แทน fetch() ปกติใน component
   * ตัวอย่าง: const res = await authFetch("/api/weather/latest");
   */
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = new Headers(options.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");

      const opts = { ...options, headers };

      const res = await fetch(url, opts);
      if (!res.ok) {
        // ถ้า token หมดอายุ → logout อัตโนมัติ
        if (res.status === 401) {
          logout();
        }
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      try {
        return await res.json();
      } catch {
        return null;
      }
    },
    [token, logout]
  );

  return (
    <AuthContext.Provider value={{ token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
