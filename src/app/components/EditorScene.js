// app/components/EditorScene.js
"use client";
import { useRef, Suspense, useState, useEffect, useMemo, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls, Html, Grid } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

function Loader() { return <Html center>Loading...</Html>; }

// This component automatically centers any loaded model and places its base at y=0
const CenteredModel = forwardRef(({ modelUrl, ...props }, ref) => {
  const { scene } = useGLTF(modelUrl);
  // useMemo is crucial for performance, preventing re-cloning on every render
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    // Calculate the bounding box of the model
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    
    // Calculate the lowest point of the model on the Y-axis
    const verticalOffset = -box.min.y;
    
    // Shift the model so its base is at y=0 and it's centered on X and Z
    clonedScene.position.set(-center.x, verticalOffset, -center.z);
  }, [clonedScene]);

  return <primitive ref={ref} object={clonedScene} {...props} />;
});
CenteredModel.displayName = 'CenteredModel';


// This component renders a single building and its transform controls
function Building({ data, isSelected, onSelect, onUpdate, transformMode, setOrbitEnabled }) {
  const groupRef = useRef();

  return (
    <>
      {/* This group is the actual object in the scene. We get a ref to it. */}
      <group 
        ref={groupRef} 
        position={data.position} 
        rotation={data.rotation} 
        scale={data.scale}
        onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
      >
        <CenteredModel modelUrl={data.modelUrl} />
      </group>

      {/* Conditionally render the controls as a SIBLING to the group */}
      {isSelected && !data.isAnchored && (
        <TransformControls
          // Explicitly attach the controls to the group using the ref
          object={groupRef}
          mode={transformMode}
          onDraggingChanged={(event) => setOrbitEnabled(!event.value)}
          onMouseUp={(e) => {
            if (e?.target?.object) {
              const obj = e.target.object;
              onUpdate({ ...data, position: obj.position.toArray(), rotation: obj.rotation.toArray(), scale: obj.scale.toArray() });
            }
          }}
        />
      )}
    </>
  );
}

// This component renders the draggable handles for resizing the ground
function ResizeHandles({ groundSize, setGroundSize, setOrbitEnabled }) {
  const handleSize = 2;
  const halfWidth = groundSize[0] / 2;
  const halfDepth = groundSize[1] / 2;
  const handlePointerDown = (e) => { e.stopPropagation(); setOrbitEnabled(false); e.target.setPointerCapture(e.pointerId); };
  const handlePointerUp = (e) => { setOrbitEnabled(true); e.target.releasePointerCapture(e.pointerId); };
  const handleDrag = (e, axis, direction) => {
    if (e.buttons !== 1) return;
    const pos = e.point;
    if (axis === 'x') {
      const newWidth = Math.max(20, (pos.x * direction) * 2);
      setGroundSize([newWidth, groundSize[1]]);
    } else {
      const newDepth = Math.max(20, (pos.z * direction) * 2);
      setGroundSize([groundSize[0], newDepth]);
    }
  };
  return (
    <group>
      <mesh position={[halfWidth, 0.5, 0]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'x', 1)}>
        <boxGeometry args={[handleSize, handleSize, handleSize * 2]} /><meshStandardMaterial color="cyan" />
      </mesh>
      <mesh position={[-halfWidth, 0.5, 0]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'x', -1)}>
        <boxGeometry args={[handleSize, handleSize, handleSize * 2]} /><meshStandardMaterial color="cyan" />
      </mesh>
      <mesh position={[0, 0.5, halfDepth]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'z', 1)}>
        <boxGeometry args={[handleSize * 2, handleSize, handleSize]} /><meshStandardMaterial color="cyan" />
      </mesh>
      <mesh position={[0, 0.5, -halfDepth]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'z', -1)}>
        <boxGeometry args={[handleSize * 2, handleSize, handleSize]} /><meshStandardMaterial color="cyan" />
      </mesh>
    </group>
  );
}

// This component renders the semi-transparent ghost model for placement
function GhostModel({ modelUrl, position }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  useEffect(() => {
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    const verticalOffset = -box.min.y;
    clonedScene.position.set(-center.x, verticalOffset, -center.z);
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.5;
        child.castShadow = false;
      }
    });
  }, [clonedScene]);
  return <primitive object={clonedScene} position={position} />;
}

// This is the main component that assembles the entire 3D scene
export default function EditorScene({ buildings, onPlaceBuilding, selected, setSelected, currentModel, setCurrentModel, groundSize, setGroundSize, showResizeHandles, transformMode, setBuildings }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [ghostPosition, setGhostPosition] = useState([0, 0, 0]);

  const handleGroundClick = (event) => {
    event.stopPropagation();
    if (currentModel) {
      const newPosition = event.point.toArray();
      newPosition[1] = 0;
      onPlaceBuilding({ id: Date.now(), modelUrl: currentModel.url, position: newPosition, rotation: [0, 0, 0], scale: [1, 1, 1] });
      setCurrentModel(null);
      setSelected(null);
    } else {
      setSelected(null);
    }
  };

  const handleUpdateBuilding = (updatedBuilding) => {
    setBuildings(prev => prev.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
  };

  return (
    <Canvas shadows camera={{ position: [50, 50, 50], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight castShadow position={[100, 100, 50]} intensity={2} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleGroundClick} onPointerMove={(e) => { if (currentModel) setGhostPosition([e.point.x, 0, e.point.z]); }} receiveShadow>
        <planeGeometry args={groundSize} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      <Grid position={[0, 0.01, 0]} args={groundSize} cellSize={10} cellThickness={1} cellColor="#6f6f6f" sectionSize={50} sectionThickness={1.5} sectionColor="#00d4ff" infiniteGrid={false} />
      
      {showResizeHandles && <ResizeHandles groundSize={groundSize} setGroundSize={setGroundSize} setOrbitEnabled={setOrbitEnabled} />}
      
      <Suspense fallback={<Loader />}>
        {currentModel && <GhostModel modelUrl={currentModel.url} position={ghostPosition} />}
        {buildings.map(building => (
          <Building key={building.id} data={building} isSelected={selected === building.id} onSelect={setSelected} onUpdate={handleUpdateBuilding} transformMode={transformMode} setOrbitEnabled={setOrbitEnabled} />
        ))}
      </Suspense>
      
      <OrbitControls makeDefault enabled={orbitEnabled} />
    </Canvas>
  );
}