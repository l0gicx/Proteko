// app/components/Modal.js
"use client";

import { useGame } from '../context/GameContext';
import styles from './Modal.module.css';

const Modal = () => {
  const { isModalOpen, modalContent, handleQuestionAnswer } = useGame();
  if (!isModalOpen || !modalContent) return null;

  const { type, data, player } = modalContent;

  if (type === 'question') {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h3>Pyetje</h3>
          <div className={styles.questionText}>{data.question}</div>
          <div className={styles.optionsGrid}>
            {data.options.map((opt, idx) => (
              <button
                key={idx}
                className={styles.optionButton}
                onClick={() => handleQuestionAnswer(player, data, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Modal;
