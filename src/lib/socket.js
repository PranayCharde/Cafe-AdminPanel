import { io } from "socket.io-client";

// Resolve live backend socket URL from environment variable or current host
const resolveSocketUrl = () => {
  // 1. Explicit Socket.IO live URL
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // 2. Derive from live API URL (strip /api suffix if present)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }

  // 3. In browser production environment (e.g. Vercel with custom domain/proxy)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin;
  }

  // 4. Default local development backend
  return "http://localhost:5001";
};

export const SOCKET_URL = resolveSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"], // Ensures fast WebSocket with polling fallback
  reconnectionAttempts: 20,
  reconnectionDelay: 1500,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("🟢 Connected to Live Cafe Realtime WebSocket:", socket.id, "at", SOCKET_URL);
  socket.emit("join_admin");
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ WebSocket connection attempt failed at", SOCKET_URL, ":", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Disconnected from Cafe Realtime WebSocket. Reason:", reason);
});

export const initSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const getSocket = () => socket;
export default socket;
