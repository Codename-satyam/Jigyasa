import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function AnimatedShapes() {
  const groupRef = useRef();
  const particlesRef = useRef();
  const torusRef = useRef();

  const particleCount = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 40;
      pos[i + 1] = (Math.random() - 0.5) * 40;
      pos[i + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  const initialPositions = useMemo(() => {
    return new Float32Array(positions);
  }, [positions]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotate main group
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.3;
      groupRef.current.rotation.y += 0.001;
    }

    // Animate particles
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const pos = posAttr.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Wave motion
        pos[i3] = initialPositions[i3] + Math.sin(t * 0.5 + i) * 2;
        pos[i3 + 1] = initialPositions[i3 + 1] + Math.cos(t * 0.3 + i * 0.5) * 2;
        pos[i3 + 2] = initialPositions[i3 + 2] + Math.sin(t * 0.4 + i * 0.3) * 2;
      }
      posAttr.needsUpdate = true;
    }

    // Animate torus
    if (torusRef.current) {
      torusRef.current.rotation.y += 0.0005;
      torusRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          color="#00ffff"
          sizeAttenuation
          transparent
          opacity={0.7}
        />
      </points>

      {/* Rotating Wireframe Torus */}
      <mesh ref={torusRef} position={[0, 0, 0]}>
        <torusGeometry args={[12, 8, 16, 100]} />
        <meshStandardMaterial
          color="#ff00ff"
          wireframe
          transparent
          opacity={0.25}
          emissive="#ff00ff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Secondary Torus for depth */}
      <mesh position={[0, 0, 0]} scale={0.7}>
        <torusGeometry args={[12, 8, 16, 100]} />
        <meshStandardMaterial
          color="#00ffff"
          wireframe
          transparent
          opacity={0.15}
          emissive="#00ffff"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Corner Boxes */}
      <mesh position={[-15, 15, -15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>

      <mesh position={[15, 15, -15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>

      <mesh position={[-15, -15, -15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>

      <mesh position={[15, -15, -15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>
    </group>
  );
}

function QuizBackground3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 20, 100]} />

      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} color="#00ffff" />

      {/* Directional light for depth */}
      <directionalLight
        position={[10, 10, 20]}
        intensity={0.6}
        color="#ffffff"
      />

      {/* Point lights for glow */}
      <pointLight position={[-20, 20, 20]} intensity={0.5} color="#00ffff" />
      <pointLight position={[20, -20, 20]} intensity={0.4} color="#ff00ff" />

      {/* Animated shapes */}
      <AnimatedShapes />
    </Canvas>
  );
}

export default QuizBackground3D;
