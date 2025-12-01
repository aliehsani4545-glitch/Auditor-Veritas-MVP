import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingCube() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Lägg till en liten pulserande effekt
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      
      // Liten hover-effekt
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Box ref={meshRef} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
          transparent
          opacity={0.9}
          emissive="#1d4ed8"
          emissiveIntensity={0.2}
        />
      </Box>
    </Float>
  );
}

export default function AnimatedCube() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <RotatingCube />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}