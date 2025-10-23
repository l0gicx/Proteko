// app/components/SoundPanel.js
"use client";
import { X } from 'lucide-react';
import styles from '../editor/editor.module.css';

export default function SoundPanel({ onToggle }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Sound Manager</span>
        <button onClick={onToggle} className={styles.closeButton}><X size={16} /></button>
      </div>
      <div className={styles.panelContent}>
        <p className={styles.noSelectionText}>Sound source management and event triggers will be here.</p>
        {/* Add sound controls here in the future */}
      </div>
    </div>
  );
}