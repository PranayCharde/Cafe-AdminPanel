import { io } from "socket.io-client";

// Production Live Backend on Railway
export const LIVE_BACKEND_URL = "https://cafe-backend-production-e4bb93a5.up.railway.app";

// Always connect to live Railway backend unless explicitly overridden by environment variable
const resolveSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  return LIVE_BACKEND_URL;
};

export const SOCKET_URL = resolveSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"], // Ensures fast WebSocket connection with polling fallback
  reconnectionAttempts: 30,
  reconnectionDelay: 1000,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("🟢 Connected to Cafe Realtime WebSocket:", socket.id, "at", SOCKET_URL);
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
  socket.emit("join_admin");
  return socket;
};

export const getSocket = () => socket;
export default socket;
