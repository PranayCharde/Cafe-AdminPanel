import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1500,
});

socket.on("connect", () => {
  console.log("🟢 Connected to Cafe Realtime WebSocket:", socket.id);
  socket.emit("join_admin");
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from Cafe Realtime WebSocket");
});

export const initSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const getSocket = () => socket;
export default socket;
