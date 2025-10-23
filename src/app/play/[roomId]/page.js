// app/play/[roomId]/page.js
"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { Crown, Copy, Send } from 'lucide-react';
import styles from './lobby.module.css';

let socket;

export default function GameRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter(); // Get the router instance
  const roomId = params.roomId;
  
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const playerNameRef = useRef('');

  useEffect(() => {
    let name = searchParams.get('name');
    const isHost = searchParams.get('host') === 'true';

    if (!name) {
      const randomName = "Player" + Math.floor(Math.random() * 100);
      name = prompt("Please enter your name", randomName) || randomName;
    }
    playerNameRef.current = name;

    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      // The client sends all necessary info in one go
      socket.emit('join-room', { 
        roomId, 
        playerName: playerNameRef.current,
        isHost // Tell the server if this client is the host
      });
    });

    socket.on('update-players', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('new-chat-message', (response) => {
      setChat(prevChat => [response, ...prevChat]);
    });

    // --- THE FIX IS HERE ---
    // Listen for the specific error event from the server
    socket.on('error', (errorMessage) => {
      if (errorMessage === 'Room not found') {
        toast.error('Room not found. Redirecting...');
        // Redirect the user back to the homepage after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [roomId, searchParams, router]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message && playerNameRef.current) {
      const payload = { roomId, message, senderName: playerNameRef.current };
      socket.emit('chat-message', payload);
      setMessage('');
    }
  };

  const copyRoomCode = () => { /* ... */ };
  const isHost = players.length > 0 && players[0].id === socket?.id;

  return (
    // ... The JSX for the lobby remains the same ...
    <div className={styles.lobbyContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1>Game Lobby</h1>
          <div className={styles.roomCodeContainer}>
            <span>ROOM CODE:</span>
            <strong className={styles.roomCode}>{roomId}</strong>
            <button onClick={copyRoomCode} className={styles.copyButton} title="Copy Code"><Copy size={16} /></button>
          </div>
        </div>
        <div className={styles.playerList}>
          {players.map((player, index) => (
            <div key={player.id} className={styles.playerCard}>
              {index === 0 && <Crown size={20} className={styles.hostIcon} title="Host" />}
              <div className={styles.playerAvatar}>{player.name.charAt(0).toUpperCase()}</div>
              <div className={styles.playerInfo}>
                <div className={styles.playerName}>{player.name}</div>
                {player.id === socket?.id && <div className={styles.youTag}>(You)</div>}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          {isHost ? (
            <button className={styles.startButton}>Start Game</button>
          ) : (
            <p className={styles.waitingText}>Waiting for the host to start the game...</p>
          )}
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.chatContainer}>
          <div className={styles.chatMessages}>
            {chat.map((msg, index) => (
              <div key={index} className={styles.chatMessage}><strong>{msg.senderName}:</strong> {msg.message}</div>
            ))}
          </div>
          <form onSubmit={sendMessage} className={styles.chatInputForm}>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className={styles.chatInput} />
            <button type="submit" className={styles.sendButton}><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}