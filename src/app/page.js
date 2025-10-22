// app/page.js
import Link from 'next/link';
import styles from './landing.module.css';
import LandingBackground from './components/LandingBackground';

export default function LandingPage() {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.backgroundCanvas}>
        <LandingBackground />
      </div>
      <div className={styles.contentOverlay}>
        <h1 className={styles.headline}>PROTEKO</h1>
        <p className={styles.description}>
          The Technical Labyrinth. A board game challenge designed for the students of Shkolla Profesionale Teknike Korçë.
        </p>
        <Link href="/game" className={styles.ctaButton}>
          Play Now
        </Link>
      </div>
    </div>
  );
}