// app/components/EditorScene.js
"use client";
import { useRef, Suspense, useState, useMemo, useEffect, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls, Html, Grid, PointLight } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

function Loader() { return <Html center>Loading...</Html>; }

const CenteredModel = forwardRef(({ modelUrl, ...props }, ref) => {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  useEffect(() => {
    const box = new Box3().setFromObject(clonedScene);
    const center = new Vector3();
    box.getCenter(center);
    const verticalOffset = -box.min.y;
    clonedScene.position.set(-center.x, verticalOffset, -center.z);
  }, [clonedScene]);
  return <primitive ref={ref} object={clonedScene} {...props} />;
});
CenteredModel.displayName = 'CenteredModel';

// A generic component to render any object in the scene
function SceneObject({ data, isSelected, onSelect, onUpdate, transformMode, setOrbitEnabled }) {
  const groupRef = useRef();

  const renderObject = () => {
    switch (data.type) {
      case 'model':
        return <CenteredModel modelUrl={data.url} />;
      case 'light':
        return <PointLight color={data.color} intensity={data.intensity} distance={500} castShadow />;
      default:
        return null;
    }
  };

  if (isSelected && !data.isAnchored) {
    return (
      <TransformControls object={groupRef.current} mode={transformMode} onDraggingChanged={(e) => setOrbitEnabled(!e.value)} onMouseUp={(e) => {
        if (e?.target?.object) {
          const obj = e.target.object;
          onUpdate(data.id, { position: obj.position.toArray(), rotation: obj.rotation.toArray(), scale: obj.scale.toArray() });
        }
      }}>
        <group ref={groupRef} position={data.position} rotation={data.rotation} scale={data.scale} onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}>
          {renderObject()}
        </group>
      </TransformControls>
    );
  }

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation} scale={data.scale} onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}>
      {renderObject()}
    </group>
  );
}

function ResizeHandles({ groundSize, setGroundSize, setOrbitEnabled }) {
  const handleSize = 2; const halfWidth = groundSize[0] / 2; const halfDepth = groundSize[1] / 2;
  const handlePointerDown = (e) => { e.stopPropagation(); setOrbitEnabled(false); e.target.setPointerCapture(e.pointerId); };
  const handlePointerUp = (e) => { setOrbitEnabled(true); e.target.releasePointerCapture(e.pointerId); };
  const handleDrag = (e, axis, direction) => { if (e.buttons !== 1) return; const pos = e.point; if (axis === 'x') { const newWidth = Math.max(20, (pos.x * direction) * 2); setGroundSize([newWidth, groundSize[1]]); } else { const newDepth = Math.max(20, (pos.z * direction) * 2); setGroundSize([groundSize[0], newDepth]); } };
  return ( <group> <mesh position={[halfWidth, 0.5, 0]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'x', 1)}> <boxGeometry args={[handleSize, handleSize, handleSize * 2]} /><meshStandardMaterial color="cyan" /> </mesh> <mesh position={[-halfWidth, 0.5, 0]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'x', -1)}> <boxGeometry args={[handleSize, handleSize, handleSize * 2]} /><meshStandardMaterial color="cyan" /> </mesh> <mesh position={[0, 0.5, halfDepth]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'z', 1)}> <boxGeometry args={[handleSize * 2, handleSize, handleSize]} /><meshStandardMaterial color="cyan" /> </mesh> <mesh position={[0, 0.5, -halfDepth]} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerMove={(e) => handleDrag(e, 'z', -1)}> <boxGeometry args={[handleSize * 2, handleSize, handleSize]} /><meshStandardMaterial color="cyan" /> </mesh> </group> );
}

function GhostObject({ currentObject, position }) {
  if (!currentObject) return null;
  
  if (currentObject.type === 'model') {
    const { scene } = useGLTF(currentObject.url);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    useEffect(() => {
      const box = new Box3().setFromObject(clonedScene); const center = new Vector3(); box.getCenter(center); const verticalOffset = -box.min.y;
      clonedScene.position.set(-center.x, verticalOffset, -center.z);
      clonedScene.traverse((child) => { if (child.isMesh) { child.material = child.material.clone(); child.material.transparent = true; child.material.opacity = 0.5; child.castShadow = false; } });
    }, [clonedScene]);
    return <primitive object={clonedScene} position={position} />;
  }

  if (currentObject.type === 'light') {
    return (
      <mesh position={position}>
        <sphereGeometry args={[1]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.5} wireframe />
      </mesh>
    );
  }

  return null;
}

export default function EditorScene({ sceneObjects, onPlaceObject, selected, setSelected, currentObject, setCurrentObject, groundSize, setGroundSize, transformMode, setSceneObjects }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [ghostPosition, setGhostPosition] = useState([0, 0, 0]);

  const handleGroundClick = (event) => {
    event.stopPropagation();
    if (currentObject) {
      const newPosition = event.point.toArray();
      newPosition[1] = currentObject.type === 'light' ? 5 : 0;
      onPlaceObject({ id: Date.now(), ...currentObject, position: newPosition, rotation: [0, 0, 0], scale: [1, 1, 1] });
      setCurrentObject(null);
      setSelected(null);
    } else {
      setSelected(null);
    }
  };

  const handleUpdateObject = (id, newProps) => {
    setSceneObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...newProps } : obj));
  };

  return (
    <Canvas shadows camera={{ position: [50, 50, 50], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <Grid position={[0, 0.01, 0]} args={groundSize} cellSize={10} cellThickness={1} cellColor="#6f6f6f" sectionSize={50} sectionThickness={1.5} sectionColor="#3498db" infiniteGrid={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleGroundClick} onPointerMove={(e) => { if (currentObject) setGhostPosition(e.point.toArray()); }} receiveShadow>
        <planeGeometry args={groundSize} />
        <meshStandardMaterial color="#21252b" />
      </mesh>
      <Suspense fallback={<Loader />}>
        <GhostObject currentObject={currentObject} position={ghostPosition} />
        {sceneObjects.map(obj => (
          <SceneObject key={obj.id} data={obj} isSelected={selected === obj.id} onSelect={setSelected} onUpdate={handleUpdateObject} transformMode={transformMode} setOrbitEnabled={setOrbitEnabled} />
        ))}
      </Suspense>
      <OrbitControls makeDefault enabled={orbitEnabled} />
    </Canvas>
  );
}