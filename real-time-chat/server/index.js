const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Gerekirse tüm domainlere izin ver
app.use(cors());

const server = http.createServer(app);

// CORS için izin verilen domainler
const allowedOrigins = [
  "http://localhost:5173", // yerel frontend
  "https://react-sms-app.vercel.app", // canlı frontend
  "https://socket-server-dl73.onrender.com" // canlı backend
];

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Origin yoksa (Postman gibi), izin ver
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy hatası: ${origin} izinsiz erişim denemesi`;
        console.error(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
  },
});

// Socket bağlantı işlemleri
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  // Mesaj gönderme
  socket.on("send_message", (data) => {
    console.log("Mesaj alındı:", data);
    io.emit("receive_message", data);
  });

  // Ping-pong sistemi (isteğe bağlı)
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Bağlantı kesilince
  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
