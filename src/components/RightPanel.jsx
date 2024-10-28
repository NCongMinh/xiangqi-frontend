import React from "react";
import styles from "../styles/RightPanel.module.css";

const Progress = ({ value, max = 100 }) => (
  <div className={styles["progress-container"]}>
    <div
      className={styles["progress-bar"]}
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
);

const PlayerInfo = ({ name, level, avatarUrl }) => (
  <div className={styles["player-card"]}>
    <div className={styles["avatar-section"]}>
      <div className={styles.avatar}>
        <img
          src={avatarUrl || "/api/placeholder/80/80"}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
    <div className={styles["info-section"]}>
      <h3 className={styles["player-name"]}>{name}</h3>
      <div>
        <div className={styles["level-text"]}>Level {level}</div>
        <Progress value={level} max={100} />
      </div>
    </div>
  </div>
);

const RightPanel = ({ gameState }) => {
  return (
    <div className={styles["right-panel"]}>
      {/* Player 1 Info */}
      <PlayerInfo
        name="Cong Minh"
        level={75}
        avatarUrl="/api/placeholder/80/80"
      />

      {/* Move History */}
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

      {/* Player 2 Info */}
      <PlayerInfo
        name="Hien Duc"
        level={45}
        avatarUrl="/api/placeholder/80/80"
      />
    </div>
  );
};

export default RightPanel;
