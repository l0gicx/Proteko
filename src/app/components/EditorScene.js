// app/components/EditorScene.js
"use client";
import { useRef, Suspense, useState, useMemo, useEffect, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls, Html, useTexture, useAnimations } from '@react-three/drei';
import { Box3, Vector3, RepeatWrapping } from 'three';

function Loader() { return <Html center>Loading...</Html>; }

const CenteredModel = forwardRef(({ modelUrl, ...props }, ref) => {
  const { scene, animations } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions, names } = useAnimations(animations, clonedScene);
  useEffect(() => { if (names.length > 0) actions[names[0]]?.play(); }, [actions, names]);
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

function SceneObject({ data, onSelect }) {
  const objectToRender = useMemo(() => {
    switch (data.type) {
      case 'model':
        return <CenteredModel modelUrl={data.url} />;
      default:
        return null;
    }
  }, [data.type, data.url]);

  return (
    <group 
      name={data.id} 
      userData={{ isAnchored: data.isAnchored }}
      position={data.position} 
      rotation={data.rotation} 
      scale={data.scale} 
      onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
    >
      {objectToRender}
    </group>
  );
}

// --- THE FIX IS HERE: Moved GhostObject and Ground before EditorScene ---

function GhostObject({ currentObject, position }) {
  if (!currentObject || currentObject.type !== 'model') return null;
  
  const { scene } = useGLTF(currentObject.url);
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
      }
    });
  }, [clonedScene]);

  return <primitive object={clonedScene} position={position} />;
}

function Ground({ groundSize, onClick, onPointerMove }) {
  const texture = useTexture('/grid-decal.png');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(groundSize[0] / 10, groundSize[1] / 10);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={onClick} onPointerMove={onPointerMove} visible={false}>
        <planeGeometry args={[10000, 10000]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={groundSize} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </>
  );
}

// This is now the last component in the file
export default function EditorScene({ sceneObjects, onPlaceObject, selected, setSelected, currentObject, setCurrentObject, groundSize, setGroundSize, transformMode, setSceneObjects }) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [ghostPosition, setGhostPosition] = useState([0, 0, 0]);
  const sceneRef = useRef();

  const selected3DObject = useMemo(() => {
    if (selected && sceneRef.current) {
      return sceneRef.current.getObjectByName(selected);
    }
    return null;
  }, [selected, sceneObjects]);

  const handleGroundClick = (event) => {
    event.stopPropagation();
    if (currentObject) {
      const newPosition = ghostPosition;
      newPosition[1] = 0; 
      onPlaceObject({ id: Date.now(), ...currentObject, position: newPosition, rotation: [0, 0, 0], scale: [1, 1, 1] });
      setCurrentObject(null);
      setSelected(null);
    } else {
      setSelected(null);
    }
  };

  const handleUpdateObject = (id, newProps) => {
    if (newProps.position) {
      newProps.position[1] = Math.max(0, newProps.position[1]);
    }
    setSceneObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...newProps } : obj));
  };

  return (
    <Canvas shadows camera={{ position: [50, 50, 50], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[100, 100, 50]} intensity={1.5} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      
      <Ground 
        groundSize={groundSize}
        onClick={handleGroundClick}
        onPointerMove={(e) => { if (currentObject) setGhostPosition(e.point.toArray()); }}
      />

      <Suspense fallback={<Loader />}>
        <GhostObject currentObject={currentObject} position={ghostPosition} />
        <scene ref={sceneRef}>
          {sceneObjects
            .filter(obj => obj.type === 'model')
            .map(obj => (
              <SceneObject key={obj.id} data={obj} onSelect={setSelected} />
          ))}
        </scene>
      </Suspense>
      
      {selected3DObject && !selected3DObject.userData.isAnchored && (
        <TransformControls
          object={selected3DObject}
          mode={transformMode}
          onDraggingChanged={(e) => setOrbitEnabled(!e.value)}
          onMouseUp={() => {
            if (selected3DObject) {
              handleUpdateObject(selected, {
                position: selected3DObject.position.toArray(),
                rotation: [selected3DObject.rotation.x, selected3DObject.rotation.y, selected3DObject.rotation.z],
                scale: selected3DObject.scale.toArray(),
              });
            }
          }}
        />
      )}
      
      <OrbitControls makeDefault enabled={orbitEnabled} />
    </Canvas>
  );
}