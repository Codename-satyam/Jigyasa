import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup & Retro Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Add fog to fade the grid out in the distance (matches the dark retro background)
    scene.fog = new THREE.FogExp2(0x111122, 0.015);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 30); // Raised slightly to look down the grid

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111122, 1); // Solid retro dark blue/purple background
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Infinite Scrolling Neon Grid (The Floor)
    const gridSize = 200;
    const gridDivisions = 50;
    // Purple center line, Green grid lines
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xb000ff, 0x004400);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    // 5. Warp-Speed Starfield
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 200; // x
      starPositions[i + 1] = Math.random() * 100 - 10; // y (keep mostly above the grid)
      starPositions[i + 2] = (Math.random() - 0.5) * 200; // z
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff, // Retro cyan
      size: 1.5,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 6. Floating Retro "Data Cubes"
    const cubes = [];
    const colors = [0x39ff14, 0xffd700, 0xff003c]; // Retro Green, Gold, Red

    for (let i = 0; i < 6; i++) {
      // Chunky, un-smoothed geometry for that retro polygon look
      const geometry = new THREE.BoxGeometry(4, 4, 4);
      
      // Wireframe inside, solid slightly transparent outside
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });

      const cube = new THREE.Mesh(geometry, material);
      
      // Place them randomly along the grid
      cube.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 15 - 2, // Floating height
        (Math.random() - 0.5) * 100 - 20
      );
      
      scene.add(cube);
      cubes.push({
        mesh: cube,
        rotSpeedX: (Math.random() > 0.5 ? 1 : -1) * 0.01,
        rotSpeedY: (Math.random() > 0.5 ? 1 : -1) * 0.02,
        floatOffset: Math.random() * Math.PI * 2, // For bobbing up and down
      });
    }

    // 7. Animation Loop
    let animationFrameId;
    const gridSpeed = 0.2; // How fast the floor moves
    const starSpeed = 0.5; // How fast stars fly at the camera

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Animate Grid (Creates infinite scrolling illusion)
      gridHelper.position.z += gridSpeed;
      if (gridHelper.position.z > 4) {
        gridHelper.position.z = 0; // Reset to loop seamlessly
      }

      // Animate Stars (Warp effect moving towards camera)
      const positions = stars.geometry.attributes.position.array;
      for (let i = 2; i < positions.length; i += 3) {
        positions[i] += starSpeed;
        
        // If a star goes behind the camera, reset it far into the distance
        if (positions[i] > 50) {
          positions[i] = -150;
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;

      // Animate Cubes (Spinning and floating)
      const time = Date.now() * 0.002;
      cubes.forEach((cube) => {
        cube.mesh.rotation.x += cube.rotSpeedX;
        cube.mesh.rotation.y += cube.rotSpeedY;
        // Subtle bobbing up and down
        cube.mesh.position.y += Math.sin(time + cube.floatOffset) * 0.02;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Cleanup to prevent memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      container?.removeChild(renderer.domElement);
      
      // ✅ CORRECTED DISPOSE LOGIC
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      cubes.forEach(c => {
        c.mesh.geometry.dispose();
        c.mesh.material.dispose();
      });
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
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Ensures it stays behind your UI
        pointerEvents: 'none', // Prevents it from blocking clicks on your UI
      }}
    />
  );
};

export default ThreeDBackground;