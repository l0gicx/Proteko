// app/components/LandingBackground.js
"use client";
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';

function Shape({ position, color, args }) {
  const ref = useRef();
  
  // Animate the shape's rotation on every frame
  useFrame((state, delta) => {
    ref.current.rotation.x += delta * 0.1;
    ref.current.rotation.y += delta * 0.15;
  });

  return (
    <Icosahedron ref={ref} args={args} position={position}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.8} />
    </Icosahedron>
  );
}

export default function LandingBackground() {
  // An array of shapes to render
  const shapes = [
    { position: [-4, 0, -10], color: '#3498db', args: [1.5] },
    { position: [4, -2, -8], color: '#2ecc71', args: [1] },
    { position: [5, 3, -12], color: '#e74c3c', args: [1.2] },
    { position: [-6, -3, -9], color: '#f1c40f', args: [0.8] },
  ];

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={100} />
      <pointLight position={[-10, -10, -10]} intensity={50} color="#2980b9" />
      
      {shapes.map((shape, index) => (
        <Shape key={index} {...shape} />
      ))}
    </Canvas>
  );
}