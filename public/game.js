const socket = io();
const arena = document.getElementById("arena");

const players = {};
const speed = 5;

function createPlayer(id, x, color) {
  const p = document.createElement("div");
  p.className = "player";
  p.style.left = x + "px";

  p.innerHTML = `
    <div class="health"></div>
    <div class="head">
      <div class="eye left"></div>
      <div class="eye right"></div>
    </div>
    <div class="body"></div>
    <div class="arm left"></div>
    <div class="arm right"></div>
  `;

  p.style.filter = `hue-rotate(${color}deg)`;
  arena.appendChild(p);

  players[id] = { el: p, x, hp: 100 };
}

socket.on("state", serverPlayers => {
  for (let id in serverPlayers) {
    if (!players[id]) {
      createPlayer(id, serverPlayers[id].x, serverPlayers[id].color);
    }
    players[id].x = serverPlayers[id].x;
    players[id].hp = serverPlayers[id].hp;
    players[id].el.style.left = players[id].x + "px";
    players[id].el.querySelector(".health").style.width =
      players[id].hp * 0.6 + "px";
  }
});

function send(action) {
  socket.emit("action", action);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") send("left");
  if (e.key === "ArrowRight") send("right");
  if (e.key === " ") send("attack");
});

/* Mobile buttons */
left.onclick = () => send("left");
right.onclick = () => send("right");
attack.onclick = () => send("attack");
