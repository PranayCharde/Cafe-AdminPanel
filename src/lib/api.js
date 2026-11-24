// Secure API client for Cafe-AdminPanel
export const LIVE_API_URL = "https://cafe-backend-production-e4bb93a5.up.railway.app/api";

const resolveApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }
  if (import.meta.env.VITE_SOCKET_URL) {
    return `${import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, "")}/api`;
  }
  return LIVE_API_URL;
};

export const API_BASE = resolveApiBase();

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("cafe_admin_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    console.error("Network communication error:", netErr);
    const err = new Error("Backend server unreachable. Verify network or server status.");
    err.isNetworkError = true;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  // Handle unauthorized or forbidden responses (token expired / revoked)
  if (res.status === 401 || (res.status === 403 && !endpoint.includes("/auth/admin-login"))) {
    if (token) {
      localStorage.removeItem("cafe_admin_token");
      window.dispatchEvent(
        new CustomEvent("admin_session_expired", {
          detail: {
            message: data.message || "Your administrator session has expired. Please sign in again.",
          },
        })
      );
    }
  }

  if (!res.ok) {
    const error = new Error(data.message || data.error || `Request failed (${res.status})`);
    error.response = { status: res.status, data };
    throw error;
  }

  // Return standard format { data }
  return { data };
}

export const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: "GET", headers }),
  post: (endpoint, body, headers) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers) =>
    apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: "DELETE", headers }),
};

export const authApi = {
  adminLogin: (credentials) => api.post("/auth/admin-login", credentials),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const orderApi = {
  getAll: (params) => {
    let url = "/orders";
    if (params) {
      const q = new URLSearchParams(params).toString();
      url += `?${q}`;
    }
    return api.get(url);
  },
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const tableApi = {
  getAll: () => api.get("/tables"),
  getByNumber: (tableNumber) => api.get(`/tables/${tableNumber}`),
  create: (data) => api.post("/tables", data),
  updateStatus: (tableNumber, status) => api.put(`/tables/${tableNumber}/status`, { status }),
  delete: (tableNumber) => api.delete(`/tables/${tableNumber}`),
};

export const menuApi = {
  getCategories: () => api.get("/menu/categories"),
  getProducts: (params) => {
    let url = "/menu/products";
    if (params) {
      const q = new URLSearchParams(params).toString();
      url += `?${q}`;
    }
    return api.get(url);
  },
  createProduct: (data) => api.post("/menu/products", data),
  updateProduct: (id, data) => api.put(`/menu/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/menu/products/${id}`),
};

export const reservationApi = {
  getAll: () => api.get("/reservations"),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
};

export const contactApi = {
  getAll: () => api.get("/contact"),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
};
