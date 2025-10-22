// app/components/UnderConstruction.js
import styles from './UnderConstruction.module.css';

export default function UnderConstruction() {
  return (
    <div className={styles.container}>
      {/* The SVG component has been replaced with this div */}
      <div className={styles.icon}>⚠️</div>
      
      <h2 className={styles.title}>Game Under Construction</h2>
      <p className={styles.subtitle}>
        Exciting things are being built. Please check back later!
      </p>
    </div>
  );
}