// app/components/GameScene.js
"use client";
import { useRef, useEffect, useMemo, forwardRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, useGLTF, useAnimations, Html, useTexture, Environment } from '@react-three/drei';
import { Box3, Vector3, RepeatWrapping } from 'three';

// A simple loader to show while models are loading within the scene
function Loader() { 
  return <Html center style={{ color: 'white', fontSize: '1.5rem' }}>Loading Assets...</Html>; 
}

// A helper component that centers any loaded model and places its base at y=0
const CenteredModel = forwardRef(({ modelUrl, ...props }, ref) => {
  const { scene, animations } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { actions, names } = useAnimations(animations, clonedScene);
  
  useEffect(() => { 
    if (names.length > 0) actions[names[0]]?.play(); 
  }, [actions, names]);

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

// A simple component to render any object from your saved scene data
function SceneObject({ data }) {
  return (
    <group position={data.position} rotation={data.rotation} scale={data.scale}>
      <CenteredModel modelUrl={data.url} />
    </group>
  );
}

// --- NEW: A dedicated component for the game board itself ---
function GameBoard() {
  // Use your original board image as the texture
  const texture = useTexture('/board.png');

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow castShadow>
      <planeGeometry args={[150, 84.375]} /> {/* Dimensions matching the board image aspect ratio */}
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// The main component with the cutscene logic
export default function GameScene({ sceneData }) {
  const cameraControlsRef = useRef();

  useEffect(() => {
    const controls = cameraControlsRef.current;
    if (controls) {
      controls.enabled = false;

      const runCutscene = async () => {
        // Start high and wide
        await controls.setLookAt(0, 100, 150, 0, 0, 0, false);
        await controls.zoomTo(1, false);
        
        // Swoop down to the gameplay view
        await controls.setLookAt(0, 80, 50, 0, 0, 0, true);

        controls.enabled = true;
      };

      setTimeout(runCutscene, 500);
    }
  }, []);

  return (
    <Canvas shadows camera={{ position: [0, 100, 150], fov: 50 }}>
      {/* --- THE FIX IS HERE --- */}
      {/* 1. Add Environment lighting for realistic reflections and ambient light */}
      <Environment preset="city" intensity={0.6} />
      
      {/* 2. Keep your main lights */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[50, 80, 25]} 
        intensity={2.0} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <CameraControls ref={cameraControlsRef} />

      <Suspense fallback={<Loader />}>
        {/* 3. Render the game board itself */}
        <GameBoard />

        {/* 4. Render all the objects from your saved JSON file */}
        {sceneData && sceneData.objects && sceneData.objects.map(obj => (
          <SceneObject key={obj.id} data={obj} />
        ))}
      </Suspense>
      
      {/* 5. Add a floor to receive shadows, positioned below the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -35, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </Canvas>
  );
}