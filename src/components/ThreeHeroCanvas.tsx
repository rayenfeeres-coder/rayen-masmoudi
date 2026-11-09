import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const ThreeHeroCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // PMREM Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0x0c1e3d, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, 2.5);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    const cyanPointLight = new THREE.PointLight(0x38bdf8, 3, 10);
    cyanPointLight.position.set(0, -1, 1.5);
    scene.add(cyanPointLight);

    // ==========================================
    // PROCEDURAL 3D ROCKET GROUP (Matches Agency Logo)
    // ==========================================
    const rocketMasterGroup = new THREE.Group();
    scene.add(rocketMasterGroup);

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.18,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant aerodynamic red
      metalness: 0.65,
      roughness: 0.25,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.1,
    });

    const windowGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.85,
      opacity: isSoftwareGl ? 0.6 : 1,
      transparent: true,
      ior: 1.5,
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.7,
      roughness: 0.25,
    });

    const engineNozzleMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.3,
    });

    // 1. Rocket Fuselage (Center Body)
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.65, 2.2, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    rocketMasterGroup.add(bodyMesh);

    // 2. Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.55, 1.1, 32);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.y = 1.65;
    rocketMasterGroup.add(noseMesh);

    // 3. Circular Porthole Window
    const winRimGeo = new THREE.TorusGeometry(0.24, 0.05, 16, 32);
    const winRimMesh = new THREE.Mesh(winRimGeo, rimMat);
    winRimMesh.position.set(0, 0.45, 0.58);
    winRimMesh.rotation.x = 0;
    rocketMasterGroup.add(winRimMesh);

    const glassGeo = new THREE.CircleGeometry(0.22, 32);
    const glassMesh = new THREE.Mesh(glassGeo, windowGlassMat);
    glassMesh.position.set(0, 0.45, 0.6);
    rocketMasterGroup.add(glassMesh);

    // 4. Engine Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.4, 32, 1, true);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, engineNozzleMat);
    nozzleMesh.position.y = -1.25;
    rocketMasterGroup.add(nozzleMesh);

    // 5. 3 Swept Aerodynamic Fins
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const finShape = new THREE.Shape();
      finShape.moveTo(0, 0);
      finShape.lineTo(0.7, -0.6);
      finShape.lineTo(0.55, -0.9);
      finShape.lineTo(0, -0.7);
      finShape.closePath();

      const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
      const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.rotation.y = angle;
      finMesh.position.set(Math.cos(angle) * 0.52, -0.4, -Math.sin(angle) * 0.52);
      rocketMasterGroup.add(finMesh);
    }

    // 6. Glowing Orbital Orbit Ring (Matches Logo neon cyan-blue & gold)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const orbitGeo = new THREE.TorusGeometry(2.3, 0.06, 24, 100);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
    orbitMesh.rotation.x = Math.PI / 3;
    orbitMesh.rotation.y = Math.PI / 6;
    ringGroup.add(orbitMesh);

    // Second complementary warm orbit ring
    const orbitGeo2 = new THREE.TorusGeometry(2.5, 0.035, 16, 80);
    const orbitMat2 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.4,
      metalness: 0.7,
      roughness: 0.3,
    });
    const orbitMesh2 = new THREE.Mesh(orbitGeo2, orbitMat2);
    orbitMesh2.rotation.x = -Math.PI / 4;
    orbitMesh2.rotation.y = -Math.PI / 5;
    ringGroup.add(orbitMesh2);

    // 7. Engine Thruster Flame Plume
    const flameGeo = new THREE.ConeGeometry(0.32, 1.2, 16);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
      transparent: true,
      opacity: 0.9,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = -1.95;
    flameMesh.rotation.x = Math.PI;
    rocketMasterGroup.add(flameMesh);

    const outerFlameGeo = new THREE.ConeGeometry(0.48, 1.8, 16);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.5,
    });
    const outerFlameMesh = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    outerFlameMesh.position.y = -2.15;
    outerFlameMesh.rotation.x = Math.PI;
    rocketMasterGroup.add(outerFlameMesh);

    // 8. 3D Space Particle Field (1000 stars)
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x38bdf8); // Cyan
    const color2 = new THREE.Color(0x60a5fa); // Electric blue
    const color3 = new THREE.Color(0xf59e0b); // Orange

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;

      const pickColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      particleColors[i * 3] = pickColor.r;
      particleColors[i * 3 + 1] = pickColor.g;
      particleColors[i * 3 + 2] = pickColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Initial Rocket orientation tilted at a dynamic 35-degree launch angle (like the logo)
    rocketMasterGroup.rotation.z = -0.55;
    rocketMasterGroup.rotation.x = 0.25;
    rocketMasterGroup.position.set(0.2, 0.1, 0);

    // Mouse Tracking with Spring Kinematics
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.45;
      mouse.targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x = THREE.MathUtils.damp(mouse.x, mouse.targetX, 4, delta);
      mouse.y = THREE.MathUtils.damp(mouse.y, mouse.targetY, 4, delta);

      // Rocket hover float physics
      const floatY = Math.sin(elapsedTime * 2.2) * 0.12;
      const floatX = Math.cos(elapsedTime * 1.5) * 0.08;
      rocketMasterGroup.position.y = 0.1 + floatY + mouse.y * 0.5;
      rocketMasterGroup.position.x = 0.2 + floatX + mouse.x * 0.5;

      // Rocket tilt response to cursor
      rocketMasterGroup.rotation.y = mouse.x * 0.8 + Math.sin(elapsedTime * 1.2) * 0.1;
      rocketMasterGroup.rotation.x = 0.25 - mouse.y * 0.6;

      // Dynamic flame flicker
      const flameScale = 0.9 + Math.sin(elapsedTime * 28) * 0.25;
      flameMesh.scale.set(1, flameScale, 1);
      outerFlameMesh.scale.set(1 + Math.sin(elapsedTime * 20) * 0.15, flameScale * 1.1, 1);

      // Orbit rings rotation
      ringGroup.rotation.z = elapsedTime * 0.25;
      ringGroup.rotation.y = elapsedTime * 0.15;

      // Particles slow drift
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bodyGeo.dispose();
      noseGeo.dispose();
      winRimGeo.dispose();
      glassGeo.dispose();
      orbitGeo.dispose();
      orbitGeo2.dispose();
      flameGeo.dispose();
      outerFlameGeo.dispose();
      particleGeo.dispose();
      bodyMat.dispose();
      noseMat.dispose();
      rimMat.dispose();
      windowGlassMat.dispose();
      finMat.dispose();
      engineNozzleMat.dispose();
      orbitMat.dispose();
      orbitMat2.dispose();
      flameMat.dispose();
      outerFlameMat.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] md:h-[540px] lg:h-[600px] flex items-center justify-center">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* Decorative Glow Ring Backdrops (behind canvas) */}
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-orange-500/15 blur-[80px] pointer-events-none translate-y-16" />
    </div>
  );
};
