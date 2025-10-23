// app/components/AnimationPanel.js
"use client";
import { X } from 'lucide-react';
import styles from '../editor/editor.module.css';

export default function AnimationPanel({ onToggle }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Animation Settings</span>
        <button onClick={onToggle} className={styles.closeButton}><X size={16} /></button>
      </div>
      <div className={styles.panelContent}>
        <p className={styles.noSelectionText}>
          Timeline and keyframe controls will appear here.
        </p>
        {/* Future animation controls will go here */}
      </div>
    </div>
  );
}