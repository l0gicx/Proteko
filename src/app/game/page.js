// app/game/page.js
// We don't need a dynamic route for this example yet
import GameScene from '../components/GameScene';
import styles from './game.module.css';

export default function GamePage() {
  return (
    <div className={styles.gameContainer}>
      <GameScene />
    </div>
  );
}