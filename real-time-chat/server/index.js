const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",  // frontend adresi
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("send_message", (data) => {
    console.log("Mesaj alındı:", data);
    io.emit("receive_message", data);  // herkese yayınla
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Sunucu 3001 portunda çalışıyor");
});
