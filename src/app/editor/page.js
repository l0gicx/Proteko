// app/editor/page.js
"use client";
import { useState, useRef } from 'react'; // <-- Add useRef back
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import EditorScene from '../components/EditorScene';
import Toolbox from '../components/Toolbox';
import ModelPreloader from '../components/ModelPreloader';
import MainToolbar from '../components/MainToolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import LightingPanel from '../components/LightingPanel';
import SoundPanel from '../components/SoundPanel';
import AnimationPanel from '../components/AnimationPanel';
import styles from './editor.module.css';

export default function EditorPage() {
  const [sceneObjects, setSceneObjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentObject, setCurrentObject] = useState(null);
  const [groundSize, setGroundSize] = useState([100, 100]);
  const [transformMode, setTransformMode] = useState('translate');
  const [panels, setPanels] = useState({ 
    toolbox: true, 
    properties: true,
    lighting: false,
    sounds: false,
    animation: false,
  });

  // Add the ref for the file input back
  const fileInputRef = useRef(null);

  const handleTogglePanel = (panelName) => {
    if (['properties', 'lighting', 'sounds', 'animation'].includes(panelName)) {
       setPanels(prev => ({
         ...prev,
         properties: panelName === 'properties' ? !prev.properties : false,
         lighting: panelName === 'lighting' ? !prev.lighting : false,
         sounds: panelName === 'sounds' ? !prev.sounds : false,
         animation: panelName === 'animation' ? !prev.animation : false,
         [panelName]: !prev[panelName]
       }));
    } else {
      setPanels(prev => ({ ...prev, [panelName]: !prev[panelName] }));
    }
  };

  const handlePlaceObject = (newObject) => {
    let objectWithProps = { ...newObject };
    if (newObject.type === 'model') {
      objectWithProps = { ...objectWithProps, isAnchored: false, canCollide: true };
    }
    setSceneObjects(prev => [...prev, objectWithProps]);
  };

  const handleUpdateObject = (id, newProps) => {
    setSceneObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...newProps } : obj));
  };

  // --- ADDED BACK: EXPORT/IMPORT LOGIC ---
  const handleExport = () => {
    const sceneData = { objects: sceneObjects, groundSize };
    const sceneJson = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([sceneJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proteko-city.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('City exported successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const sceneData = JSON.parse(text);
        if (sceneData.objects && sceneData.groundSize) {
          setSceneObjects(sceneData.objects);
          setGroundSize(sceneData.groundSize);
          alert('City imported successfully!');
        } else {
          alert('Invalid city file format.');
        }
      } catch (error) {
        alert('Failed to read or parse the city file.');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };
  // --- END OF ADDED LOGIC ---

  const selectedObjectData = sceneObjects.find(obj => obj.id === selected);
  const isAnyRightPanelOpen = panels.properties || panels.lighting || panels.sounds || panels.animation;

  return (
    <div className={styles.editorLayout}>
      <ModelPreloader />
      
      <header className={styles.topBar}>
        <h1>PROTEKO City Editor</h1>
        <MainToolbar panels={panels} onTogglePanel={handleTogglePanel} />
        <div className={styles.topBarActions}>
          {/* ADDED BACK: The Export and Import buttons */}
          <button onClick={handleExport}>Export</button>
          <button onClick={handleImportClick}>Import</button>
        </div>
      </header>

      {/* ADDED BACK: The hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".json"
      />

      <div className={styles.mainContent}>
        <PanelGroup direction="horizontal">
          {panels.toolbox && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30} className={styles.panel}>
                <Toolbox onSelectItem={setCurrentObject} onToggle={() => handleTogglePanel('toolbox')} />
              </Panel>
              <PanelResizeHandle className={styles.resizeHandle} />
            </>
          )}
          <Panel minSize={30}>
            <EditorScene
              sceneObjects={sceneObjects}
              setSceneObjects={setSceneObjects}
              selected={selected}
              setSelected={setSelected}
              currentObject={currentObject}
              setCurrentObject={setCurrentObject}
              onPlaceObject={handlePlaceObject}
              groundSize={groundSize}
              setGroundSize={setGroundSize}
              transformMode={transformMode}
            />
          </Panel>
          
          {isAnyRightPanelOpen && (
            <>
              <PanelResizeHandle className={styles.resizeHandle} />
              <Panel defaultSize={20} minSize={15} maxSize={30} className={styles.panel}>
                {panels.properties && (
                  <PropertiesPanel 
                    selectedObject={selectedObjectData} 
                    onUpdate={handleUpdateObject}
                    onTransformModeChange={setTransformMode}
                    transformMode={transformMode}
                    onToggle={() => handleTogglePanel('properties')}
                  />
                )}
                {panels.lighting && <LightingPanel onToggle={() => handleTogglePanel('lighting')} />}
                {panels.sounds && <SoundPanel onToggle={() => handleTogglePanel('sounds')} />}
                {panels.animation && <AnimationPanel onToggle={() => handleTogglePanel('animation')} />}
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      {currentObject && <div className={styles.placingNotice}>Placing: {currentObject.name}. Click on the ground to place.</div>}
    </div>
  );
}