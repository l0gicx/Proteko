// app/components/PropertiesPanel.js
"use client";
import { X } from 'lucide-react';
import styles from '../editor/editor.module.css'; // We can reuse the editor styles

export default function PropertiesPanel({ selectedObject, onUpdate, onTransformModeChange, transformMode, onToggle }) {
  const handlePropertyChange = (propName, value) => {
    onUpdate(selectedObject.id, { [propName]: value });
  };

  const renderModelProperties = () => (
    <div className={styles.sidebarSection}>
      <h3>Behavior</h3>
      <div className={styles.propertyRow}><label className={styles.toggle}><input type="checkbox" checked={selectedObject.isAnchored} onChange={(e) => handlePropertyChange('isAnchored', e.target.checked)} /><span className={styles.slider}></span> Is Anchored</label></div>
      <div className={styles.propertyRow}><label className={styles.toggle}><input type="checkbox" checked={selectedObject.canCollide} onChange={(e) => handlePropertyChange('canCollide', e.target.checked)} /><span className={styles.slider}></span> Can Collide</label></div>
    </div>
  );

  const renderLightProperties = () => (
    <div className={styles.sidebarSection}>
      <h3>Light Settings</h3>
      <div className={styles.propertyRow}><label>Color</label><input type="color" value={selectedObject.color} onChange={(e) => handlePropertyChange('color', e.target.value)} className={styles.colorInput} /></div>
      <div className={styles.propertyRow}><label>Intensity ({selectedObject.intensity})</label><input type="range" min="0" max="200" step="1" value={selectedObject.intensity} onChange={(e) => handlePropertyChange('intensity', parseFloat(e.target.value))} /></div>
    </div>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>Properties</span>
        <button onClick={onToggle} className={styles.closeButton}><X size={16} /></button>
      </div>
      <div className={styles.panelContent}>
        {selectedObject ? (
          <>
            <div className={styles.sidebarSection}>
              <h3>Transform</h3>
              <div className={styles.modeButtons}>
                <button className={`${styles.modeButton} ${transformMode === 'translate' ? styles.active : ''}`} onClick={() => onTransformModeChange('translate')}>Move</button>
                <button className={`${styles.modeButton} ${transformMode === 'rotate' ? styles.active : ''}`} onClick={() => onTransformModeChange('rotate')}>Rotate</button>
                <button className={`${styles.modeButton} ${transformMode === 'scale' ? styles.active : ''}`} onClick={() => onTransformModeChange('scale')}>Scale</button>
              </div>
            </div>
            {selectedObject.type === 'model' && renderModelProperties()}
            {selectedObject.type === 'light' && renderLightProperties()}
          </>
        ) : (
          <p className={styles.noSelectionText}>Select an object to see its properties.</p>
        )}
      </div>
    </div>
  );
}