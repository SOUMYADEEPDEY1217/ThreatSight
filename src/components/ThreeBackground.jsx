import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Particle field ──
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x2dd4bf,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Connection lines (dynamic network) ──
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.08,
    });

    const buildLines = () => {
      lineGroup.clear();
      const pos = particleGeo.attributes.position.array;
      const maxDist = 18;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i*3] - pos[j*3];
          const dy = pos[i*3+1] - pos[j*3+1];
          const dz = pos[i*3+2] - pos[j*3+2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < maxDist) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(pos[i*3], pos[i*3+1], pos[i*3+2]),
              new THREE.Vector3(pos[j*3], pos[j*3+1], pos[j*3+2]),
            ]);
            lineGroup.add(new THREE.Line(lineGeo, lineMat));
          }
        }
      }
    };

    // ── Central glowing sphere ──
    const sphereGeo = new THREE.SphereGeometry(12, 32, 32);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x0d3340,
      emissive: 0x0a4a5c,
      emissiveIntensity: 0.3,
      wireframe: false,
      transparent: true,
      opacity: 0.25,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Wireframe overlay on sphere
    const wireGeo = new THREE.SphereGeometry(12.1, 16, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // ── Orbiting ring ──
    const ringGeo = new THREE.TorusGeometry(18, 0.2, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Second ring
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(22, 0.1, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.2 })
    );
    ring2.rotation.x = Math.PI / 5;
    ring2.rotation.z = Math.PI / 6;
    scene.add(ring2);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0x0a2a3a, 2);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x2dd4bf, 2, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    // ── Mouse parallax ──
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Animation ──
    let frameId;
    let lineTimer = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i*3]   += velocities[i].x;
        pos[i*3+1] += velocities[i].y;
        pos[i*3+2] += velocities[i].z;
        // Wrap around
        if (pos[i*3] > 100)   pos[i*3]   = -100;
        if (pos[i*3] < -100)  pos[i*3]   = 100;
        if (pos[i*3+1] > 100) pos[i*3+1] = -100;
        if (pos[i*3+1] < -100) pos[i*3+1] = 100;
        if (pos[i*3+2] > 100) pos[i*3+2] = -100;
        if (pos[i*3+2] < -100) pos[i*3+2] = 100;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Rebuild lines every 30 frames (performance)
      lineTimer++;
      if (lineTimer % 30 === 0) buildLines();

      // Rotate central elements
      sphere.rotation.y += 0.003;
      sphere.rotation.x += 0.001;
      wire.rotation.y += 0.004;
      wire.rotation.x -= 0.001;
      ring.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;
      ring2.rotation.y += 0.002;

      // Camera parallax
      camera.position.x += (mouseX * 15 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 15 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    buildLines();
    animate();

    // ── Resize ──
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
