const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  socket.on("disconnect", () => {
    if (socket.id === players.white) {
      delete players.white;
    } else if (socket.id === players.black) {
      delete players.black;
    }
  });

  socket.on("move", (move) => {
    try {
      if ((chess.turn() === "w" && socket.id !== players.white) ||
          (chess.turn() === "b" && socket.id !== players.black)) {
        return;
      }

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        socket.emit("invalidMove", move);
      }
    } catch (err) {
      console.error(err);
      socket.emit("error", "Invalid move");
    }
  });

  socket.emit("boardState", chess.fen());
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
  console.log("http://localhost:3000");

});
