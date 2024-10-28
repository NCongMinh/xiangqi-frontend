import React, { useState } from "react";
import styles from "../styles/LeftPanel.module.css";

const LeftPanel = ({ gameState }) => {
  const [activeView, setActiveView] = useState("view");

  const renderPanel = () => {
    switch (activeView) {
      case "view":
        return (
          <div className={styles.panelContent}>
            <h3>Game Information</h3>
            <div>
              <p>Current Side: {gameState.side === 1 ? "Red" : "Green"}</p>
              <p>
                Pieces Captured: {gameState.pieces.filter((p) => p.dead).length}
              </p>
            </div>
          </div>
        );
      case "create":
        return (
          <div className={styles.panelContent}>
            <h3>Create Mode</h3>
            <div>
              <p>Setup your custom game configuration here</p>
              <p>Feature coming soon...</p>
            </div>
          </div>
        );
      case "chat":
        return (
          <div className={styles.panelContent}>
            <h3>Chat</h3>
            <div className={styles.chatContainer}>
              <p>Chat messages will appear here...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.leftPanel}>
      {/* Turn indicator */}
      <div className={styles.turnIndicator}>
        {gameState.side === 1 ? "Red's Turn" : "Green's Turn"}
      </div>

      {/* Content panel */}
      <div className={styles.contentPanel}>{renderPanel()}</div>

      {/* Navigation buttons */}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.navButton} ${
            activeView === "view" ? styles.active : ""
          }`}
          onClick={() => setActiveView("view")}
        >
          View
        </button>
        <button
          className={`${styles.navButton} ${
            activeView === "create" ? styles.active : ""
          }`}
          onClick={() => setActiveView("create")}
        >
          Create
        </button>
        <button
          className={`${styles.navButton} ${
            activeView === "chat" ? styles.active : ""
          }`}
          onClick={() => setActiveView("chat")}
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;
