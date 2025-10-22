// app/components/ModelViewer.js
"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import styles from './ModelViewer.module.css';

// This is the component that actually loads and displays the model
function Model({ url }) {
  // useGLTF hook loads the model and gives us its parts
  const { scene, nodes } = useGLTF(url);

  // *** THIS IS THE MOST IMPORTANT PART FOR DEBUGGING ***
  // We log the 'nodes' object to the console. This will show you
  // the exact names of all the parts in your 3D model.
  console.log("Inspecting model:", url);
  console.log("Available nodes:", nodes);

  // The <primitive> object is a powerful way to render the entire
  // loaded scene without needing to know the names of its parts.
  // It's perfect for initial inspection.
  return <primitive object={scene} />;
}

// This is the main component for the test page
export default function ModelViewer({ modelUrl }) {
  return (
    <div className={styles.viewerContainer}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* The <Stage> component from drei is a helper that automatically
            sets up good lighting, shadows, and centers the model for you. */}
        <Stage environment="city" intensity={0.6}>
          <Model url={modelUrl} />
        </Stage>
        
        {/* OrbitControls allow you to rotate and zoom with the mouse */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}