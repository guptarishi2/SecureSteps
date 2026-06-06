// Registers the realtime location-sharing handlers on a shared Socket.IO
// instance (created in Server.js so REST + sockets share one port/deploy).
function registerSocket(io) {
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("join-room", (data) => {
      const room = data && data.room;
      if (!room) return;
      socket.join(String(room));
      console.log("joined room", room);
    });

    socket.on("send-location", ({ latitude, longitude, roomname }) => {
      if (!roomname) return;
      socket.to(String(roomname)).emit("receive-location", { latitude, longitude });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
    });
  });
}

module.exports = registerSocket;
