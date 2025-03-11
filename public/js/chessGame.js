// const socket = io();
// const chess = new Chess();
// const boardElement = document.querySelector(".chessboard");

// let draggedPiece = null;
// let sourceSquare = null;
// let playerRole = null;

// const renderBoard = () => {
//   const board = chess.board();
//   boardElement.innerHTML = "";
//   board.forEach((row, rowIndex) => {
//     row.forEach((square, squareindex) => {
//       const squareElement = document.createElement("div");
//       squareElement.classList.add(
//         "square",
//         (rowIndex + squareindex) % 2 === 0 ? "light" : "dark"
//       );

//       squareElement.dataset.row = rowIndex;
//       squareElement.dataset.column = squareindex;

//       if (square) {
//         const pieceElement = document.createElement("div");
//         pieceElement.classList.add(
//           "piece",
//           square.color === "w" ? "white" : "black" //   piece.type
//         );
//         pieceElement.innerText = getPieceUnicode(square); ///this one has empty string at 1:26:38
//         pieceElement.draggable = playerRole === square.color;

//         pieceElement.addEventListener("dragstart", (e) => {
//           if (pieceElement.draggable) {
//             draggedPiece = pieceElement;
//             sourceSquare = { row: rowIndex, col: squareindex };
//             e.dataTransfer.setData("text/plain", ""); ////to makesure that it runs in cross platforms
//           }
//         });

//         pieceElement.addEventListener("dragend", (e) => {
//           draggedPiece = null;
//           sourceSquare = null;
//         });
//         squareElement.appendChild(pieceElement);
//       } //if anything goes wrong check from above till here

//       squareElement.addEventListener("dragover", function (e) {
//         e.preventDefault();
//       });

//       squareElement.addEventListener("drop", function (e) {
//         e.preventDefault();
//         if (draggedPiece) {
//           const targetSquare = {
//             row: parseInt(squareElement.dataset.row),
//             col: parseInt(squareElement.dataset.col),
//           };
//           handleMove(sourceSquare, targetSquare);
//         }
//       });

//       boardElement.appendChild(squareElement); //this at  63line
//     });
//   });

//   if (playerRole === "b") {
//     boardElement.classList.add("flipped");
//   } else {
//     boardElement.classList.remove("flipped");
//   }
// };

// const handleMove = (source, target) => {
//   //handle move ::: at 1:41:28 , is at 68
//   const move = {
//     from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
//     to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
//     promotion: "q",
//   };
//   socket.emit("move", move); //sending the new move to the backend
// };

// const getPieceUnicode = (piece) => {
//   const unicodePieces = {
//     p: "♟", // BLACK CHESS PAWN
//     r: "♜", // BLACK CHESS ROOK
//     n: "♞", // BLACK CHESS KNIGHT
//     b: "♝", // BLACK CHESS BISHOP
//     q: "♛", // BLACK CHESS QUEEN
//     k: "♚", // BLACK CHESS KING
//     P: "♙", // WHITE CHESS PAWN
//     R: "♖", // WHITE CHESS ROOK
//     N: "♘", // WHITE CHESS KNIGHT
//     B: "♗", // WHITE CHESS BISHOP
//     Q: "♕", // WHITE CHESS QUEEN
//     K: "♔", // WHITE CHESS KING
//   };
//   return unicodePieces[piece.type] || "";
// };
// socket.on("playerRole", function (role) {
//   //at 14602 at 95
//   playerRole = role;
//   renderBoard();
// });

// socket.on("spectatorRole", function () {
//   playerRole = null;
//   renderBoard();
// });
// socket.on("boardState", function (fen) {
//   //the new fen equation formed will be loaded freshly by chess.load and then the board is rendered with new equations
//   chess.load(fen);
//   renderBoard();
// });
// socket.on("move", function (move) {
//   //jo bhi move hua hoga use hum receive karke chaladenge, aur boardRender kardenge
//   chess.move(move);
//   renderBoard();
// });
// renderBoard();

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = colIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: colIndex };
            e.dataTransfer.setData("text/plain", ""); // Ensuring cross-platform compatibility
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => e.preventDefault());

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });

  boardElement.classList.toggle("flipped", playerRole === "b");
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  };
  return unicodePieces[piece.type] || "";
};

socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

renderBoard();
