// app/editor/page.js
"use client";
import { useState } from 'react';
import { availableModels } from '../data/cityModels';
import EditorScene from '../components/EditorScene';
import styles from './editor.module.css';

// NEW: A dedicated component for the properties panel
function PropertiesPanel({ selectedBuilding, onUpdate }) {
  if (!selectedBuilding) {
    return null; // Don't render if nothing is selected
  }

  const handlePropertyChange = (propName, value) => {
    onUpdate(selectedBuilding.id, { [propName]: value });
  };

  return (
    <div className={styles.propertiesPanel}>
      <h3>Properties</h3>
      <div className={styles.propertyRow}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={selectedBuilding.isAnchored}
            onChange={(e) => handlePropertyChange('isAnchored', e.target.checked)}
          />
          <span className={styles.slider}></span>
          Is Anchored
        </label>
      </div>
      <div className={styles.propertyRow}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={selectedBuilding.canCollide}
            onChange={(e) => handlePropertyChange('canCollide', e.target.checked)}
          />
          <span className={styles.slider}></span>
          Can Collide
        </label>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const [buildings, setBuildings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentModel, setCurrentModel] = useState(null);
  const [groundSize, setGroundSize] = useState([100, 100]);
  const [showResizeHandles, setShowResizeHandles] = useState(true);
  const [transformMode, setTransformMode] = useState('translate');

  const handlePlaceBuilding = (newBuilding) => {
    // Add the new properties with default values
    const buildingWithProps = {
      ...newBuilding,
      isAnchored: false,
      canCollide: true,
    };
    setBuildings(prev => [...prev, buildingWithProps]);
  };

  const handleUpdateBuildingProperties = (id, newProps) => {
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, ...newProps } : b));
  };

  const handleSave = () => {
    const sceneData = { buildings, groundSize };
    localStorage.setItem('myCityScene', JSON.stringify(sceneData));
    alert('City saved!');
  };

  const handleLoad = () => {
    const savedScene = localStorage.getItem('myCityScene');
    if (savedScene) {
      const sceneData = JSON.parse(savedScene);
      setBuildings(sceneData.buildings || []);
      setGroundSize(sceneData.groundSize || [100, 100]);
      alert('City loaded!');
    } else {
      alert('No saved city found.');
    }
  };

  const selectedBuildingData = buildings.find(b => b.id === selected);

  return (
    <div className={styles.editorLayout}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <h2>Toolbox</h2>
          <p>Select a model to place on the scene.</p>
          <div className={styles.modelList}>
            {availableModels.map(model => (
              <button key={model.name} className={styles.modelButton} onClick={() => setCurrentModel(model)}>
                {model.name}
              </button>
            ))}
          </div>
        </div>

        <PropertiesPanel selectedBuilding={selectedBuildingData} onUpdate={handleUpdateBuildingProperties} />

        <div className={styles.sidebarSection}>
          <h3>Transform Mode</h3>
          <div className={styles.modeButtons}>
            <button className={`${styles.modeButton} ${transformMode === 'translate' ? styles.active : ''}`} onClick={() => setTransformMode('translate')}>Move</button>
            <button className={`${styles.modeButton} ${transformMode === 'rotate' ? styles.active : ''}`} onClick={() => setTransformMode('rotate')}>Rotate</button>
            <button className={`${styles.modeButton} ${transformMode === 'scale' ? styles.active : ''}`} onClick={() => setTransformMode('scale')}>Scale</button>
          </div>
        </div>
        
        <div className={styles.sidebarSection}>
          <h3>Options</h3>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showResizeHandles} onChange={(e) => setShowResizeHandles(e.target.checked)} />
            <span className={styles.slider}></span>
            Show Resize Handles
          </label>
        </div>
        
        <div className={styles.sidebarSection}>
          <h3>Actions</h3>
          <div className={styles.actions}>
            <button onClick={handleSave}>Save City</button>
            <button onClick={handleLoad}>Load City</button>
          </div>
        </div>
        {currentModel && <div className={styles.placingNotice}>Placing: {currentModel.name}</div>}
      </div>
      <div className={styles.sceneContainer}>
        <EditorScene
          buildings={buildings}
          setBuildings={setBuildings}
          selected={selected}
          setSelected={setSelected}
          currentModel={currentModel}
          setCurrentModel={setCurrentModel}
          onPlaceBuilding={handlePlaceBuilding}
          groundSize={groundSize}
          setGroundSize={setGroundSize}
          showResizeHandles={showResizeHandles}
          transformMode={transformMode}
        />
      </div>
    </div>
  );
}