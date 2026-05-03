import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreatGlobe({ score = 0 }) {
  const mountRef = useRef(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;

  useEffect(() => {
    const mount = mountRef.current;
    const size = mount.clientWidth;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Main globe
    const geoMain = new THREE.SphereGeometry(1, 48, 48);
    const matMain = new THREE.MeshPhongMaterial({
      color: 0x0d2233,
      emissive: 0x061422,
      transparent: true,
      opacity: 0.85,
    });
    const globeMesh = new THREE.Mesh(geoMain, matMain);
    scene.add(globeMesh);

    // Wireframe
    const geoWire = new THREE.SphereGeometry(1.02, 18, 18);
    const matWire = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireFrame = new THREE.Mesh(geoWire, matWire);
    scene.add(wireFrame);

    // Threat glow ring (color changes with score)
    const getScoreColor = (s) => {
      if (s <= 20) return 0x22c55e;
      if (s <= 40) return 0x3b82f6;
      if (s <= 60) return 0xf59e0b;
      if (s <= 80) return 0xf97316;
      return 0xef4444;
    };

    const ringGeo = new THREE.TorusGeometry(1.3, 0.025, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: getScoreColor(score),
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Orbiting dot
    const dotGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    scene.add(dot);

    // Lighting
    scene.add(new THREE.AmbientLight(0x1a3a4a, 3));
    const pLight = new THREE.PointLight(0x2dd4bf, 3, 10);
    pLight.position.set(3, 3, 3);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(getScoreColor(score), 2, 10);
    pLight2.position.set(-2, -2, 2);
    scene.add(pLight2);

    let frameId;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.02;

      globeMesh.rotation.y += 0.005;
      wireFrame.rotation.y -= 0.007;
      wireFrame.rotation.x += 0.003;
      ring.rotation.z += 0.01;

      // Orbiting dot
      dot.position.x = Math.cos(t) * 1.3;
      dot.position.z = Math.sin(t) * 1.3;
      dot.position.y = Math.sin(t * 0.5) * 0.3;

      // Update colors based on current score
      const c = getScoreColor(scoreRef.current);
      ringMat.color.setHex(c);
      pLight2.color.setHex(c);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full aspect-square" />;
}
