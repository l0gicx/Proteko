// app/components/MainToolbar.js
"use client";
import { LayoutGrid, Wrench, Lightbulb, Music, Film } from 'lucide-react';
import styles from './MainToolbar.module.css';

export default function MainToolbar({ panels, onTogglePanel }) {
  return (
    <div className={styles.toolbar}>
      <button className={`${styles.toolButton} ${panels.toolbox ? styles.active : ''}`} onClick={() => onTogglePanel('toolbox')} title="Toolbox">
        <LayoutGrid size={18} /><span>Toolbox</span>
      </button>
      <div className={styles.separator} /> {/* Optional separator for visual grouping */}
      <button className={`${styles.toolButton} ${panels.properties ? styles.active : ''}`} onClick={() => onTogglePanel('properties')} title="Properties">
        <Wrench size={18} /><span>Properties</span>
      </button>
      <button className={`${styles.toolButton} ${panels.lighting ? styles.active : ''}`} onClick={() => onTogglePanel('lighting')} title="Lighting">
        <Lightbulb size={18} /><span>Lighting</span>
      </button>
      <button className={`${styles.toolButton} ${panels.sounds ? styles.active : ''}`} onClick={() => onTogglePanel('sounds')} title="Sounds">
        <Music size={18} /><span>Sounds</span>
      </button>
      {/* NEW BUTTON */}
      <button className={`${styles.toolButton} ${panels.animation ? styles.active : ''}`} onClick={() => onTogglePanel('animation')} title="Animation">
        <Film size={18} /><span>Animation</span>
      </button>
    </div>
  );
}