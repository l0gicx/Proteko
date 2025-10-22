// app/components/PlayerPawn.js
"use client";
import { useGLTF } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { boardCoordinates } from '../data/boardCoordinates';

export function PlayerPawn({ player }) {
  const { scene } = useGLTF('/pawn.glb');

  // Get the target 3D coordinate for the player's current position
  const targetPosition = boardCoordinates[player.position] || boardCoordinates[0];

  // Animate the pawn's position using a spring for a smooth, natural feel
  const { position } = useSpring({
    to: { position: targetPosition },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  // The <primitive> object is a powerful tool. It renders the entire
  // 3D model scene exactly as it was exported from the 3D software.
  // This avoids any issues with incorrect node names.
  return (
    <a.group position={position} dispose={null}>
      <primitive 
        object={scene.clone()} // We clone the scene to ensure each player gets a unique instance
        castShadow 
        scale={3} // Adjust scale as needed
      >
        {/* We can't apply a single material this way, so we'll rely on the model's default material for now.
            We can add color later if needed, but first let's make it appear. */}
      </primitive>
    </a.group>
  );
}

useGLTF.preload('/pawn.glb');