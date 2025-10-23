// app/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './landing.module.css';
import LandingBackground from './components/LandingBackground';

function JoinGameModal({ onClose, onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId && playerName) {
      onJoin(roomId.toUpperCase(), playerName);
    } else {
      toast.error("Please enter your name and a room code.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>&times;</button>
        <h2>Join Game Room</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={styles.modalInput} />
          <input type="text" placeholder="Enter Room Code" value={roomId} onChange={(e) => setRoomId(e.target.value)} className={styles.modalInput} maxLength="6" />
          <button type="submit" className={styles.modalButton}>Join</button>
        </form>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const createGame = () => {
    const playerName = prompt("Please enter your name to host the game:", "Host");
    if (!playerName) return;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Immediately redirect with the host flag
    router.push(`/play/${roomId}?name=${encodeURIComponent(playerName)}&host=true`);
  };

  const joinGame = (roomId, playerName) => {
    // Immediately redirect
    router.push(`/play/${roomId}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className={styles.landingContainer}>
      {isJoinModalOpen && <JoinGameModal onClose={() => setIsJoinModalOpen(false)} onJoin={joinGame} />}
      <div className={styles.backgroundCanvas}>
        <LandingBackground />
      </div>
      <div className={styles.contentOverlay}>
        <h1 className={styles.headline}>PROTEKO</h1>
        <p className={styles.description}>
          The Technical Labyrinth. Create a game or join a friend's room to begin.
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={createGame} className={styles.ctaButton}>
            Create New Game
          </button>
          <button onClick={() => setIsJoinModalOpen(true)} className={`${styles.ctaButton} ${styles.secondary}`}>
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}