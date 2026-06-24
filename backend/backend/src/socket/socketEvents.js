export const userSocketMap = new Map();

// socketEvents.js
export const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.on("join", (userId) => {
      const id = Number(userId);

      if (!userSocketMap.has(id)) {
        userSocketMap.set(id, new Set());
      }
      userSocketMap.get(id).add(socket.id);

      // ✅ Sabko broadcast karo ki yeh user online aa gaya
      io.emit("user-status-changed", { 
        userId: id, 
        status: "online" 
      });
    });

    socket.on("disconnect", () => {
      for (const [userId, socketSet] of userSocketMap.entries()) {
        socketSet.delete(socket.id);

        if (socketSet.size === 0) {
          userSocketMap.delete(userId);

          // ✅ Sabko broadcast karo ki yeh user offline ho gaya
          io.emit("user-status-changed", { 
            userId, 
            status: "offline" 
          });
        }
      }

      console.log("Socket Disconnected:", socket.id);
    });
  });
};