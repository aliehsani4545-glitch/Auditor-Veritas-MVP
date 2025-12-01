import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';

// 3D Cube med din bild som textur
function RotatingCube() {
  const meshRef = useRef();
  const [texture, setTexture] = React.useState(null);
  
  React.useEffect(() => {
    // Ladda texturen säkert
    const loader = new TextureLoader();
    loader.load('/cube.png', (loadedTexture) => {
      setTexture(loadedTexture);
    });
    
    return () => {
      if (texture) texture.dispose();
    };
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// Individuellt roterande delar (sidorna)
function RotatingParts() {
  const partsRef = useRef([]);
  
  useFrame((state) => {
    partsRef.current.forEach((part, index) => {
      if (part) {
        part.rotation.x = state.clock.getElapsedTime() * (0.1 + index * 0.05);
        part.rotation.y = state.clock.getElapsedTime() * (0.15 + index * 0.05);
        part.rotation.z = state.clock.getElapsedTime() * (0.05 + index * 0.03);
      }
    });
  });

  const positions = [
    [0, 4, 0],    // Övre del
    [0, -4, 0],   // Nedre del  
    [4, 0, 0],    // Höger del
    [-4, 0, 0],   // Vänster del
    [0, 0, 4],    // Främre del
    [0, 0, -4],   // Bakre del
  ];

  return (
    <group>
      {positions.map((position, index) => (
        <mesh
          key={index}
          position={position}
          ref={(el) => (partsRef.current[index] = el)}
        >
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial 
            color={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][index]} 
            opacity={0.3} 
            transparent 
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ImageCube() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingCube />
        <RotatingParts />
      </Canvas>
    </div>
  );
}