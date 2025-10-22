// app/components/Scene.js
"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { useGame } from '../context/GameContext';
import { Board } from './Board';
import { PlayerPawn } from './PlayerPawn';
import styles from './Scene.module.css';

export default function Scene() {
  const { players } = useGame();

  return (
    <div className={styles.sceneContainer}>
      <Canvas shadows camera={{ position: [0, 80, 100], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight
          castShadow
          position={[50, 50, 25]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Sky sunPosition={[50, 50, 25]} />

        <OrbitControls 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.1}
          minDistance={50}
          maxDistance={200}
        />

        {/* The Game World */}
        <Board />
        {players.map(player => (
          <PlayerPawn key={player.id} player={player} />
        ))}
      </Canvas>
    </div>
  );
}