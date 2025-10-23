// app/components/LightingPanel.js
"use client";
import { X } from 'lucide-react';
import styles from '../editor/editor.module.css';

export default function LightingPanel({ onToggle }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>World Lighting</span>
        <button onClick={onToggle} className={styles.closeButton}><X size={16} /></button>
      </div>
      <div className={styles.panelContent}>
        <p className={styles.noSelectionText}>Global illumination and environment settings will be here.</p>
        {/* Add lighting controls here in the future */}
      </div>
    </div>
  );
}