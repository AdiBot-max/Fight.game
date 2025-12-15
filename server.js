const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

/* ================================
   CONFIG
================================ */
const TICK_RATE = 50; // ms
const MOVE_SPEED = 10;
const HIT_RANGE = 60;
const HIT_DAMAGE = 10;

/* ================================
   SERVE CLIENT FILES
================================ */
app.use(express.static("public"));

/* ================================
   GAME STATE
================================ */
const players = {};

/* ================================
   SOCKET CONNECTION
================================ */
io.on("connection", socket => {
  console.log("Player connected:", socket.id);

  /* CREATE PLAYER */
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * 400,
    hp: 100,
    color: Math.random() * 360
  };

  /* HANDLE PLAYER ACTIONS */
  socket.on("action", action => {
    const p = players[socket.id];
    if (!p) return;

    switch (action) {
      case "left":
        p.x -= MOVE_SPEED;
        break;

      case "right":
        p.x += MOVE_SPEED;
        break;

      case "attack":
        for (const id in players) {
          if (id === socket.id) continue;

          const enemy = players[id];
          if (Math.abs(enemy.x - p.x) <= HIT_RANGE) {
            enemy.hp = Math.max(0, enemy.hp - HIT_DAMAGE);
          }
        }
        break;
    }
  });

  /* HANDLE DISCONNECT */
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
  });
});

/* ================================
   GAME LOOP
================================ */
setInterval(() => {
  io.emit("state", players);
}, TICK_RATE);

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
