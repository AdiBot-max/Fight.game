const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const players = {};

io.on("connection", socket => {
  players[socket.id] = {
    x: Math.random() * 400,
    hp: 100,
    color: Math.random() * 360
  };

  socket.on("action", act => {
    const p = players[socket.id];
    if (!p) return;

    if (act === "left") p.x -= 10;
    if (act === "right") p.x += 10;

    if (act === "attack") {
      for (let id in players) {
        if (id !== socket.id) {
          if (Math.abs(players[id].x - p.x) < 60) {
            players[id].hp -= 10;
          }
        }
      }
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("state", players);
}, 50);

http.listen(process.env.PORT || 3000);
