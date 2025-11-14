// src/config/api.ts

// 🔹 Define both backend servers
const SERVERS = [
  "https://backend-lwcx.onrender.com", // Main full backend
  "https://crm-up7m.onrender.com",     // Secondary backup backend
]

// 🔹 Automatically detect environment and select API base URL
function detectApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl

  const hostname = window.location.hostname

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000"
  }

  // For your live domains
  if (["crm.vishwnet.com", "crm.codeiing.com"].includes(hostname)) {
    // Use the main server first
    return SERVERS[0]
  }

  // Default fallback
  return SERVERS[0]
}

export const API_BASE_URL = detectApiUrl()

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: `${API_BASE_URL}/auth`,
  USERS: `${API_BASE_URL}/users`,
  LEADS: `${API_BASE_URL}/leads`,
  PRODUCTS: `${API_BASE_URL}/products`,
  ASSIGNMENTS: `${API_BASE_URL}/lead-assignments`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
}

// Helper: For file/image URLs
export function getFileUrl(url?: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${API_BASE_URL}${url}`
}

// Debugging log
console.log("[API Config] Using API URL:", API_BASE_URL)
console.log("[API Config] Hostname:", window.location.hostname)

export default API_CONFIG