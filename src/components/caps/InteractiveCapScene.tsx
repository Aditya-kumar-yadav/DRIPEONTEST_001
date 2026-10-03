import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
// --------------------------------------------------------
// Reusable Cap Component
// --------------------------------------------------------
const InteractiveCap = ({
  model = '/models/dripeon-cap.glb',
  color = '#ffffff',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  interactionStrength = 1,
  isMain = false
}: any) => {
  const capRootRef = useRef<THREE.Group>(null);

  // Interaction and breathing state
  useFrame((state) => {
    if (!capRootRef.current) return;

    // 1. Subtle breathing/floating (applied to position Y)
    const t = state.clock.getElapsedTime();
    capRootRef.current.position.y = position[1] + Math.sin(t * (isMain ? 2 : 1.2)) * 0.05;

    // 2. Cursor interaction (applied to CapRoot rotation)
    if (isMain && interactionStrength > 0) {
      // Calculate cursor influence
      // max Y rotation: ~15 degrees (0.26 rad)
      // max X rotation: ~8 degrees (0.14 rad)
      const targetRotY = (state.pointer.x * 0.26) * interactionStrength + rotation[1];
      const targetRotX = (-state.pointer.y * 0.14) * interactionStrength + rotation[0];

      // Damping/Spring interpolation for premium feel
      capRootRef.current.rotation.y = THREE.MathUtils.lerp(capRootRef.current.rotation.y, targetRotY, 0.08);
      capRootRef.current.rotation.x = THREE.MathUtils.lerp(capRootRef.current.rotation.x, targetRotX, 0.08);
    } else {
      // If not main, just gently rotate or stay static
      capRootRef.current.rotation.y = rotation[1];
      capRootRef.current.rotation.x = rotation[0];
    }
  });

  return (
    <group ref={capRootRef} position={position as [number, number, number]} rotation={rotation as [number, number, number]} scale={scale}>
      <Suspense fallback={<ModelPlaceholder color={color} />}>
        <CapModelLoader url={model} color={color} />
      </Suspense>
    </group>
  );
};

// --------------------------------------------------------
// GLB Loader Component
// --------------------------------------------------------
const CapModelLoader = ({ url, color }: { url: string, color: string }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(url,
      (gltf: any) => {
        const scene = gltf.scene.clone();
        scene.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            const newMat = child.material.clone();
            if (newMat.color) newMat.color.set(color);
            child.material = newMat;
          }
        });
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center); // Center the pivot
        setModel(scene);
      },
      undefined,
      () => {
        console.warn(`[DRIPEON] Cap model not found at ${url}. Showing placeholder.`);
        setError(true);
      }
    );
  }, [url, color]);

  if (error || !model) {
    return <ModelPlaceholder color={color} isError={error} url={url} />;
  }

  return <primitive object={model} />;
};

// --------------------------------------------------------
// Clearly Defined Placeholder
// --------------------------------------------------------
const ModelPlaceholder = ({ color, isError = false, url = '' }: any) => {
  return (
    <group>
      {/* A stylized wireframe box to represent missing geometry, NOT a fake cap */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 1, 1.8]} />
        <meshStandardMaterial color={color} wireframe={true} transparent opacity={0.3} />
      </mesh>
      {isError && (
        <Html position={[0, 0.8, 0]} center className="pointer-events-none select-none">
          <div className="bg-black/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-3 py-2 border border-red-600/30 rounded whitespace-nowrap font-bold text-center">
            <span className="text-red-500 block mb-1">Missing Model</span>
            Provide GLB at:<br />
            <span className="text-gray-300 font-mono text-[9px] lowercase">{url}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

// --------------------------------------------------------
// Scene Environment & Props
// --------------------------------------------------------
const FloatingFragments = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.05;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={1} floatIntensity={1} position={[
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8 - 4
        ]}>
          <mesh>
            <octahedronGeometry args={[Math.random() * 0.15 + 0.05]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#D90416" : "#ffffff"} transparent opacity={0.4} roughness={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Platform = () => {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Premium Product Display Platform */}
      <mesh receiveShadow>
        <cylinderGeometry args={[4, 4.2, 0.1, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Subtle Red Accent Ring */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[3.8, 0.015, 16, 100]} />
        <meshBasicMaterial color="#D90416" opacity={0.8} transparent />
      </mesh>
    </group>
  );
};

// --------------------------------------------------------
// Main Canvas Scene
// --------------------------------------------------------
export default function InteractiveCapScene() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 touch-none pointer-events-auto">
      <Canvas shadows camera={{ position: [0, 0.5, 9], fov: 38 }}>

        {/* Professional Product Lighting Setup */}
        <ambientLight intensity={0.6} />

        {/* Key light: Upper-left front */}
        <spotLight position={[-4, 6, 6]} intensity={1.5} castShadow penumbra={1} color="#ffffff" angle={0.6} />

        {/* Fill light: Opposite side */}
        <spotLight position={[6, 3, 2]} intensity={0.8} color="#f0f0f0" penumbra={1} />

        {/* Rim light: Very subtle red light from behind */}
        <spotLight position={[0, 2, -6]} intensity={2.5} color="#D90416" distance={15} penumbra={1} />

        {/* Model instances */}
        <group position={[0, -0.5, 0]}>
          {/* Main Cap (White) */}
          <InteractiveCap
            model="/models/dripeon-cap.glb"
            color="#ffffff"
            isMain={true}
            position={[1.5, 0, 1.5]}
            rotation={[0, -0.2, 0]}
            scale={1.2}
            interactionStrength={1}
          />

          {/* Secondary Cap (Red) */}
          <InteractiveCap
            model="/models/dripeon-cap.glb"
            color="#D90416"
            isMain={false}
            position={[-2.5, -0.5, -1]}
            rotation={[0, 0.8, 0]}
            scale={0.9}
            interactionStrength={0}
          />

          {/* Third Cap (Gray) */}
          <InteractiveCap
            model="/models/dripeon-cap.glb"
            color="#e5e5e5"
            isMain={false}
            position={[3.5, 0.5, -2.5]}
            rotation={[0.1, -0.8, 0]}
            scale={0.8}
            interactionStrength={0}
          />

          <Platform />
        </group>

        <FloatingFragments />

        {/* Soft shadow below caps */}
        <ContactShadows position={[0, -2.49, 0]} opacity={0.35} scale={12} blur={2.5} far={4} color="#000000" resolution={512} />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
