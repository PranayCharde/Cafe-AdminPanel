import { io } from "socket.io-client";

// Production Live Backend on Railway
export const LIVE_BACKEND_URL = "https://cafe-backend-production-e4bb93a5.up.railway.app";

// Resolve live backend socket URL dynamically
const resolveSocketUrl = () => {
  // 1. Explicit env variables override
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }

  // 2. In local development environment, default to local port 5001
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5001";
  }

  // 3. In live production (e.g. deployed on Vercel), connect to live Railway backend
  return LIVE_BACKEND_URL;
};

export const SOCKET_URL = resolveSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"], // Ensures fast WebSocket connection with polling fallback
  reconnectionAttempts: 25,
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
