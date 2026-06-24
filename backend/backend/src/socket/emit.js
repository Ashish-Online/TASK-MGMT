import { getIO } from "./index.js";
import { userSocketMap } from "./socketEvents.js";


export const emitToUser = (userId, event, data) => {
  const sockets = userSocketMap.get(Number(userId));

  if (!sockets || sockets.size === 0) return;

  const io = getIO();

  for (const socketId of sockets) {
    io.to(socketId).emit(event, data);
  }
};
