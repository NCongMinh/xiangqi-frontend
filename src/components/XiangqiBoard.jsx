"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/ChineseChess.module.css";

const BOARD_CONFIG = {
  SQUARE_SIZE: 64,
  BORDER_SIZE: 4,
  COLUMNS: 9,
  ROWS: 10,
};

const PIECE_TYPES = {
  PAWN: { RED: "兵", BLACK: "卒" },
  ROOK: { RED: "車", BLACK: "車" },
  KNIGHT: { RED: "马", BLACK: "马" },
  ELEPHANT: { RED: "相", BLACK: "象" },
  ADVISOR: { RED: "仕", BLACK: "士" },
  KING: { RED: "帅", BLACK: "将" },
  CANNON: { RED: "砲", BLACK: "炮" },
};

const INITIAL_PIECES = [
  // Red pieces (side: 1)
  [1, PIECE_TYPES.ROOK.RED, 0, 0],
  [1, PIECE_TYPES.ROOK.RED, 0, 8],
  [1, PIECE_TYPES.KNIGHT.RED, 0, 1],
  [1, PIECE_TYPES.KNIGHT.RED, 0, 7],
  [1, PIECE_TYPES.ELEPHANT.RED, 0, 2],
  [1, PIECE_TYPES.ELEPHANT.RED, 0, 6],
  [1, PIECE_TYPES.ADVISOR.RED, 0, 3],
  [1, PIECE_TYPES.ADVISOR.RED, 0, 5],
  [1, PIECE_TYPES.KING.RED, 0, 4],
  [1, PIECE_TYPES.CANNON.RED, 2, 1],
  [1, PIECE_TYPES.CANNON.RED, 2, 7],
  [1, PIECE_TYPES.PAWN.RED, 3, 0],
  [1, PIECE_TYPES.PAWN.RED, 3, 2],
  [1, PIECE_TYPES.PAWN.RED, 3, 4],
  [1, PIECE_TYPES.PAWN.RED, 3, 6],
  [1, PIECE_TYPES.PAWN.RED, 3, 8],

  // Black pieces (side: -1)
  [-1, PIECE_TYPES.ROOK.BLACK, 9, 0],
  [-1, PIECE_TYPES.ROOK.BLACK, 9, 8],
  [-1, PIECE_TYPES.KNIGHT.BLACK, 9, 1],
  [-1, PIECE_TYPES.KNIGHT.BLACK, 9, 7],
  [-1, PIECE_TYPES.ELEPHANT.BLACK, 9, 2],
  [-1, PIECE_TYPES.ELEPHANT.BLACK, 9, 6],
  [-1, PIECE_TYPES.ADVISOR.BLACK, 9, 3],
  [-1, PIECE_TYPES.ADVISOR.BLACK, 9, 5],
  [-1, PIECE_TYPES.KING.BLACK, 9, 4],
  [-1, PIECE_TYPES.CANNON.BLACK, 7, 1],
  [-1, PIECE_TYPES.CANNON.BLACK, 7, 7],
  [-1, PIECE_TYPES.PAWN.BLACK, 6, 0],
  [-1, PIECE_TYPES.PAWN.BLACK, 6, 2],
  [-1, PIECE_TYPES.PAWN.BLACK, 6, 4],
  [-1, PIECE_TYPES.PAWN.BLACK, 6, 6],
  [-1, PIECE_TYPES.PAWN.BLACK, 6, 8],
].map(([side, name, y, x]) => ({
  side,
  name,
  y,
  x,
  dead: false,
}));

const BOARD_MARKERS = [
  [2, 1],
  [2, 7],
  [3, 0],
  [3, 2],
  [3, 4],
  [3, 6],
  [3, 8],
  [6, 0],
  [6, 2],
  [6, 4],
  [6, 6],
  [6, 8],
  [7, 1],
  [7, 7],
];

const XiangqiBoard = () => {
  const [gameState, setGameState] = useState({
    side: 1,
    winner: null,
    moveHistory: [],
    pieces: INITIAL_PIECES,
  });
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const bgRef = useRef(null);

  const moveAudioRef = useRef(new Audio("/move.mp3"));
  const captureAudioRef = useRef(new Audio("/capture.mp3"));

  const checkGameEnd = (pieces) => {
    const kings = pieces.filter(
      (p) =>
        !p.dead &&
        (p.name === PIECE_TYPES.KING.RED || p.name === PIECE_TYPES.KING.BLACK)
    );
    if (kings.length < 2) {
      return kings[0]?.side === 1 ? "Red Wins!" : "Black Wins!";
    }
    return null;
  };

  const resetGame = () => {
    setGameState({
      side: 1,
      winner: null,
      moveHistory: [],
      pieces: INITIAL_PIECES,
    });
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const addMoveToHistory = (piece, fromX, fromY, toX, toY, captured) => {
    const moveText = `${
      piece.name
    } from (${fromX},${fromY}) to (${toX},${toY})${
      captured ? ` captured ${captured.name}` : ""
    }`;
    setGameState((prev) => ({
      ...prev,
      moveHistory: [...prev.moveHistory, moveText],
    }));
  };

  const en = (n) => n * BOARD_CONFIG.SQUARE_SIZE + BOARD_CONFIG.BORDER_SIZE / 2;
  const de = (v) =>
    (v - BOARD_CONFIG.BORDER_SIZE / 2) / BOARD_CONFIG.SQUARE_SIZE;
  const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

  const canGo = (piece, x, y) => {
    const dx = x - piece.x;
    const dy = y - piece.y;
    const abs = Math.abs;

    // Pawn movement
    if (
      piece.name === PIECE_TYPES.PAWN.RED ||
      piece.name === PIECE_TYPES.PAWN.BLACK
    ) {
      if (piece.cross && dy === 0 && abs(dx) === 1) return true;
      return dx === 0 && dy === piece.side;
    }

    // King movement
    if (
      piece.name === PIECE_TYPES.KING.RED ||
      piece.name === PIECE_TYPES.KING.BLACK
    ) {
      const inPalace =
        piece.side > 0
          ? x >= 3 && x <= 5 && y >= 0 && y <= 2
          : x >= 3 && x <= 5 && y >= 7 && y <= 9;
      return inPalace && abs(dx) + abs(dy) === 1;
    }

    // Advisor movement
    if (
      piece.name === PIECE_TYPES.ADVISOR.RED ||
      piece.name === PIECE_TYPES.ADVISOR.BLACK
    ) {
      const inPalace =
        piece.side > 0
          ? x >= 3 && x <= 5 && y >= 0 && y <= 2
          : x >= 3 && x <= 5 && y >= 7 && y <= 9;
      return inPalace && abs(dx) * abs(dy) === 1;
    }

    // Elephant movement
    if (
      piece.name === PIECE_TYPES.ELEPHANT.RED ||
      piece.name === PIECE_TYPES.ELEPHANT.BLACK
    ) {
      if (!(piece.side > 0 ? y >= 0 && y <= 4 : y >= 5 && y <= 9)) return false;
      if (
        gameState.pieces.some(
          (p) => !p.dead && p.y - piece.y === dy / 2 && p.x - piece.x === dx / 2
        )
      )
        return false;
      return abs(dx) === 2 && abs(dy) === 2;
    }

    // Knight movement
    if (
      piece.name === PIECE_TYPES.KNIGHT.RED ||
      piece.name === PIECE_TYPES.KNIGHT.BLACK
    ) {
      if (
        gameState.pieces.some(
          (p) =>
            !p.dead &&
            p.y - piece.y === sign(dy) * (abs(dy) - 1) &&
            p.x - piece.x === sign(dx) * (abs(dx) - 1)
        )
      )
        return false;
      return abs(dx) * abs(dy) === 2;
    }

    // Rook movement
    if (
      piece.name === PIECE_TYPES.ROOK.RED ||
      piece.name === PIECE_TYPES.ROOK.BLACK
    ) {
      if (dx * dy !== 0) return false;
      const blockingPieces = gameState.pieces.reduce((count, p) => {
        if (p === piece || p.dead) return count;
        const dx1 = (p.x - piece.x) / sign(dx);
        const dy1 = (p.y - piece.y) / sign(dy);
        if (
          (dy && p.x === piece.x && dy1 < abs(dy) && dy1 > 0) ||
          (dx && p.y === piece.y && dx1 < abs(dx) && dx1 > 0)
        ) {
          return count + 1;
        }
        return count;
      }, 0);
      return blockingPieces === 0;
    }

    // Cannon movement
    if (
      piece.name === PIECE_TYPES.CANNON.RED ||
      piece.name === PIECE_TYPES.CANNON.BLACK
    ) {
      if (dx * dy !== 0) return false;
      const blockingPieces = gameState.pieces.reduce((count, p) => {
        if (p === piece || p.dead) return count;
        const dx1 = (p.x - piece.x) / sign(dx);
        const dy1 = (p.y - piece.y) / sign(dy);
        if (
          (dy && p.x === piece.x && dy1 < abs(dy) && dy1 > 0) ||
          (dx && p.y === piece.y && dx1 < abs(dx) && dx1 > 0)
        ) {
          return count + 1;
        }
        return count;
      }, 0);

      const hasTarget = gameState.pieces.some(
        (p) => !p.dead && p.y === y && p.x === x
      );
      return hasTarget ? blockingPieces === 1 : blockingPieces === 0;
    }

    return false;
  };

  useEffect(() => {
    if (selectedPiece !== null) {
      const piece = gameState.pieces[selectedPiece];
      const moves = [];

      for (let y = 0; y <= 9; y++) {
        for (let x = 0; x <= 8; x++) {
          if (canGo(piece, x, y)) {
            const targetPiece = gameState.pieces.find(
              (p) => !p.dead && p.x === x && p.y === y
            );
            if (!targetPiece || targetPiece.side !== piece.side) {
              moves.push([x, y]);
            }
          }
        }
      }
      console.log(moves);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [selectedPiece, gameState.pieces]);

  const handleClick = (e) => {
    if (gameState.winner) return;

    const rect = bgRef.current.getBoundingClientRect();
    const x = de(e.clientX - rect.left);
    const y = de(e.clientY - rect.top);
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    const clickedPieceIndex = gameState.pieces.findIndex(
      (piece) =>
        !piece.dead &&
        Math.abs(piece.x - roundX) < 0.4 &&
        Math.abs(piece.y - roundY) < 0.4
    );

    if (clickedPieceIndex !== -1) {
      const clickedPiece = gameState.pieces[clickedPieceIndex];
      if (clickedPiece.side === gameState.side) {
        setSelectedPiece(clickedPieceIndex);
        return;
      }
    }

    if (selectedPiece !== null) {
      const piece = gameState.pieces[selectedPiece];
      if (canGo(piece, roundX, roundY)) {
        const capturedPiece = gameState.pieces.find(
          (p) => !p.dead && p.x === roundX && p.y === roundY
        );

        setGameState((prev) => {
          const newpieces = [...prev.pieces];

          if (capturedPiece) {
            newpieces[
              newpieces.findIndex((p) => p === capturedPiece)
            ].dead = true;
            captureAudioRef.current.play();
          } else {
            moveAudioRef.current.play();
          }

          const fromX = piece.x;
          const fromY = piece.y;

          newpieces[selectedPiece] = {
            ...piece,
            x: roundX,
            y: roundY,
            cross:
              (piece.name === "兵" || piece.name === "卒") &&
              (piece.side > 0 ? roundY >= 5 : roundY <= 4),
          };

          const winner = checkGameEnd(newpieces);
          addMoveToHistory(piece, fromX, fromY, roundX, roundY, capturedPiece);

          return {
            ...prev,
            pieces: newpieces,
            side: -prev.side,
            winner,
          };
        });
        setSelectedPiece(null);
      }
    }
  };

  return (
    <div className={styles["game-container"]}>
      <div className={styles["left-panel"]}>
        <div className={styles["player-area"]}>
          <div className={styles["player-info"]}>
            <div className={styles["current-turn"]}>
              {gameState.side === 1 ? "Red turn" : "Black turn"}
            </div>
          </div>
        </div>
      </div>
      <div className={styles["board-container"]}>
        <div className={styles["board-wrapper"]}>
          <div className={styles["chess-pieces"]}>
            {gameState.pieces.map((chess, i) => (
              <span
                key={i}
                className={`
                ${styles["chess-piece"]}
                ${chess.side > 0 ? styles.red : styles.green}
                ${selectedPiece === i ? styles.active : ""}
              `}
                style={{
                  top: en(chess.y),
                  left: en(chess.x),
                  display: chess.dead ? "none" : "block",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (chess.side === gameState.side && !gameState.winner) {
                    handleClick(e);
                  }
                }}
              >
                {chess.name}
              </span>
            ))}
          </div>
          <div className={styles.board} ref={bgRef} onClick={handleClick}>
            {Array(9)
              .fill(null)
              .map((_, y) => (
                <div
                  key={y}
                  className={`${styles.row} ${y === 4 ? styles.middle : ""}`}
                >
                  {Array(9)
                    .fill(null)
                    .map((_, x) => (
                      <div
                        key={x}
                        className={`
                        ${styles.square}
                        ${
                          (y === 1 && x === 4) || (y === 8 && x === 4)
                            ? styles.cross
                            : ""
                        }
                      `}
                      >
                        {validMoves.some(
                          ([mx, my]) => mx === x && my === y
                        ) && <div className={styles["valid-move-indicator"]} />}
                      </div>
                    ))}
                </div>
              ))}
            {BOARD_MARKERS.map(([y, x], i) => (
              <div
                key={i}
                className={styles.marker}
                style={{
                  top: en(y),
                  left: en(x),
                }}
              />
            ))}
          </div>
          {/* <div className={styles.board} ref={bgRef} onClick={handleClick}>
            {Array(9)
              .fill(null)
              .map((_, x) => (
                <div
                  key={`v${x}`}
                  className={styles.verticalLine}
                  style={{
                    left: `${x * squareSize + halfBorderSize}px`,
                    height: x > 0 && x < 8 ? "100%" : "50%",
                    top: x > 0 && x < 8 ? "0" : "25%",
                  }}
                />
              ))}

            {Array(10)
              .fill(null)
              .map((_, y) => (
                <div
                  key={`h${y}`}
                  className={styles.horizontalLine}
                  style={{
                    top: `${y * squareSize + halfBorderSize}px`,
                    width: "100%",
                  }}
                />
              ))}

            {validMoves.map(([x, y], index) => (
              <div
                key={`move${index}`}
                className={styles.validMoveIndicator}
                style={{
                  left: `${x * squareSize + halfBorderSize}px`,
                  top: `${y * squareSize + halfBorderSize}px`,
                }}
              />
            ))}

            <div
              className={styles.palaceLine}
              style={{
                top: "0",
                left: `${3 * squareSize + halfBorderSize}px`,
                width: `${2 * squareSize}px`,
                height: `${2 * squareSize}px`,
              }}
            />
            <div
              className={styles.palaceLine}
              style={{
                bottom: "0",
                left: `${3 * squareSize + halfBorderSize}px`,
                width: `${2 * squareSize}px`,
                height: `${2 * squareSize}px`,
              }}
            />

            {markers.map(([y, x], i) => (
              <div
                key={i}
                className={styles.marker}
                style={{
                  top: en(y),
                  left: en(x),
                }}
              />
            ))}
          </div> */}
        </div>
        <button onClick={resetGame} className={styles["reset-button"]}>
          Reset
        </button>
      </div>
      <div className={styles["right-panel"]}>
        <div className={styles["move-history"]}>
          <h3>Move History</h3>
          <div className={styles["moves-list"]}>
            {gameState.moveHistory.map((move, index) => (
              <div key={index} className={styles["move-item"]}>
                {`${index + 1}. ${move}`}
              </div>
            ))}
          </div>
        </div>
      </div>
      {gameState.winner && (
        <div className={styles["game-over"]}>
          <div className={styles["game-over-content"]}>
            <h2>{gameState.winner}</h2>
            <button onClick={resetGame} className={styles["reset-button"]}>
              Play again!
            </button>
          </div>
        </div>
      )}
    </div>
    // <div className={styles.contWrap}>
    //   <div className={styles.cont}>
    //     <div className={styles.chs}>
    //       {gameState.chsArr.map((chess, i) => (
    //         <span
    //           key={i}
    //           className={`
    //             ${styles.ch}
    //             ${chess.side > 0 ? styles.red : styles.green}
    //             ${selectedPiece === i ? styles.active : ""}
    //           `}
    //           style={{
    //             top: en(chess.y) + "px",
    //             left: en(chess.x) + "px",
    //             display: chess.dead ? "none" : "block",
    //           }}
    //         >
    //           {chess.name}
    //         </span>
    //       ))}
    //     </div>
    //     <div className={styles.bg} ref={bgRef} onClick={handleClick}>
    //       {Array(9)
    //         .fill(null)
    //         .map((_, y) => (
    //           <div
    //             key={y}
    //             className={`${styles.row} ${y === 4 ? styles.middle : ""}`}
    //           >
    //             {Array(8)
    //               .fill(null)
    //               .map((_, x) => (
    //                 <div
    //                   key={x}
    //                   className={`
    //                 ${styles.sq}
    //                 ${
    //                   (y === 1 && x === 4) || (y === 8 && x === 4)
    //                     ? styles.cross
    //                     : ""
    //                 }
    //                 ${
    //                   validMoves.some(([mx, my]) => mx === x && my === y)
    //                     ? styles.validMove
    //                     : ""
    //                 }
    //               `}
    //                 />
    //               ))}
    //           </div>
    //         ))}
    //       {markers.map(([y, x], i) => (
    //         <div
    //           key={i}
    //           className={styles.mk}
    //           style={{
    //             top: y * squareSize + halfBorderSize + "px",
    //             left: x * squareSize + halfBorderSize + "px",
    //           }}
    //         />
    //       ))}
    //     </div>
    //   </div>
    //   <div className={styles.controls}>
    //     <button onClick={resetGame} className={styles.button}>
    //       Reset Game
    //     </button>

    //     <div className={styles.moveHistory}>
    //       <h3>Move History</h3>
    //       {gameState.moveHistory.map((move, index) => (
    //         <div key={index} className={styles.moveItem}>
    //           {`${index + 1}. ${move}`}
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {gameState.winner && (
    //     <div className={styles.gameOver}>
    //       <div className={styles.gameOverContent}>
    //         <h2>{gameState.winner}</h2>
    //         <button onClick={resetGame} className={styles.button}>
    //           Play Again
    //         </button>
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
};

export default XiangqiBoard;
