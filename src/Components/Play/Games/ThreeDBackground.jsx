import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;

      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(
        positions.reduce((acc, val, idx) => {
          if (idx % 3 === 0) acc.push(new THREE.Vector3(positions[idx], positions[idx + 1], positions[idx + 2]));
          return acc;
        }, [])
      ),
      new THREE.LineBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.2,
      })
    );

    // Create floating cubes
    const cubes = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100
      );
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      cubes.push({
        mesh: cube,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
      });
      scene.add(cube);
    }

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 300);
    light.position.set(50, 50, 50);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update particles
      const positionAttribute = points.geometry.getAttribute('position');
      const positionArray = positionAttribute.array;

      for (let i = 0; i < velocities.length; i++) {
        const idx = i * 3;
        positionArray[idx] += velocities[i].x;
        positionArray[idx + 1] += velocities[i].y;
        positionArray[idx + 2] += velocities[i].z;

        // Bounce at boundaries
        if (Math.abs(positionArray[idx]) > 100) velocities[i].x *= -1;
        if (Math.abs(positionArray[idx + 1]) > 100) velocities[i].y *= -1;
        if (Math.abs(positionArray[idx + 2]) > 100) velocities[i].z *= -1;
      }

      positionAttribute.needsUpdate = true;

      // Update cubes
      cubes.forEach((cube) => {
        cube.mesh.rotation.x += cube.rotationSpeed.x;
        cube.mesh.rotation.y += cube.rotationSpeed.y;
        cube.mesh.rotation.z += cube.rotationSpeed.z;

        cube.mesh.position.x += Math.sin(Date.now() * 0.0005 + cube.mesh.position.y) * 0.1;
        cube.mesh.position.y += Math.cos(Date.now() * 0.0005 + cube.mesh.position.x) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default ThreeDBackground;
