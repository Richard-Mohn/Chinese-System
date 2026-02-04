'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Texture, Vector3, Mesh } from 'three';
import { useTexture } from '@react-three/drei';

interface FoodItemProps {
  texture: Texture;
  position: Vector3;
  scale: number;
  rotationSpeed: { x: number; y: number };
}

const FoodItem = ({ texture, position, scale, rotationSpeed }: FoodItemProps) => {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += rotationSpeed.x * delta;
      ref.current.rotation.y += rotationSpeed.y * delta;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={texture} transparent opacity={0.8} />
    </mesh>
  );
};

const FoodItems = () => {
  const textures = useTexture(['/ChineseMenu1.webp', '/ChineseMenu2.webp']);
  const items = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      const position = new Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      const scale = Math.random() * 0.5 + 0.2;
      const rotationSpeed = {
        x: Math.random() * 0.1,
        y: Math.random() * 0.1,
      };
      const texture = textures[Math.floor(Math.random() * textures.length)];
      temp.push({ position, scale, rotationSpeed, texture });
    }
    return temp;
  }, [textures]);

  return (
    <>
      {items.map((item, i) => (
        <FoodItem key={i} {...item} />
      ))}
    </>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-[-1]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FoodItems />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
