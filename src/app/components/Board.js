// app/components/Board.js
"use client";
import { boardCoordinates } from '../data/boardCoordinates';

// A small, reusable component for a single tile
function Tile({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <boxGeometry args={[9.5, 9.5, 0.5]} />
      <meshStandardMaterial color="#444" metalness={0.2} roughness={0.8} />
    </mesh>
  );
}

export function Board() {
  return (
    <>
      {/* Programmatically create a grid of tiles using our coordinates */}
      <group>
        {boardCoordinates.map((pos, index) => (
          <Tile key={index} position={[pos[0], 0, pos[2]]} />
        ))}
      </group>
      
      {/* A large ground plane to receive shadows, making it look grounded */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </>
  );
}