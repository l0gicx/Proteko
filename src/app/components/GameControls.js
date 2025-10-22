// app/components/GameControls.js
"use client";

import { useRef } from 'react';
import { useGame } from '../context/GameContext';
import styles from './GameControls.module.css';
import Dice from './Dice';

const GameControls = () => {
  const { rollDice, handleDiceResult, gameMessage, currentPlayerIndex, winner, isRolling } = useGame();
  const diceRef = useRef(null);
  const currentPlayerId = currentPlayerIndex + 1;

  const handleRollClick = () => {
    if (!diceRef.current || winner || isRolling) return;
    rollDice();
    diceRef.current.roll();
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.messageBox}>{gameMessage}</div>
      <div className={styles.actions}>
        <div className={styles.dice}>
          <Dice ref={diceRef} onRollStart={rollDice} onRollComplete={handleDiceResult} />
        </div>
        <button
          className={styles.rollButton}
          onClick={handleRollClick}
          disabled={isRolling || !!winner}
        >
          Hedh zar për Lojtarin {currentPlayerId}
        </button>
      </div>
    </div>
  );
};

export default GameControls;
