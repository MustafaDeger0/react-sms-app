const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Gerekirse tüm domainlere izin ver
app.use(cors());

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173", // yerel frontend
  "https://react-sms-app.vercel.app", // canlı frontend adresin
  // başka izin vereceğin adresler varsa buraya ekle
];

const io = new Server(server, {
  cors: {
    origin: function(origin, callback){
      if(!origin) return callback(null, true); // Postman gibi origin olmadan gelenlere izin
      if(allowedOrigins.indexOf(origin) === -1){
        const msg = `CORS policy: ${origin} izinsiz`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("send_message", (data) => {
    console.log("Mesaj alındı:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
