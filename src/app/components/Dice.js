// app/components/Dice.js
"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const FACE_ORDER = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

function makeFaceTexture(value, size = 256, bg = '#e74c3c', pip = '#ffffff') {
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext('2d');
  // background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  // draw rounded border
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = Math.max(2, size * 0.02);
  ctx.strokeRect(4, 4, size - 8, size - 8);

  // pip drawing helper
  const drawDot = (x, y, r) => {
    ctx.beginPath();
    ctx.fillStyle = pip;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // subtle inner shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.arc(x - r * 0.15, y - r * 0.15, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  };

  const r = size * 0.06;
  const cx = size / 2;
  const cy = size / 2;
  const off = size * 0.18;

  // positions for standard dice pips
  const positions = {
    1: [[cx, cy]],
    2: [[cx - off, cy - off], [cx + off, cy + off]],
    3: [[cx - off, cy - off], [cx, cy], [cx + off, cy + off]],
    4: [[cx - off, cy - off], [cx - off, cy + off], [cx + off, cy - off], [cx + off, cy + off]],
    5: [[cx - off, cy - off], [cx - off, cy + off], [cx, cy], [cx + off, cy - off], [cx + off, cy + off]],
    6: [[cx - off, cy - off], [cx - off, cy], [cx - off, cy + off], [cx + off, cy - off], [cx + off, cy], [cx + off, cy + off]],
  };

  (positions[value] || []).forEach(p => drawDot(p[0], p[1], r));

  const tex = new THREE.CanvasTexture(cvs);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const rotationsForFace = {
  // values map to orientations that put that face pointing up (+Y)
  1: new THREE.Euler(-Math.PI / 2, 0, 0), // +Z -> up
  2: new THREE.Euler(0, 0, -Math.PI / 2), // -X -> up
  3: new THREE.Euler(0, 0, 0), // +Y -> up
  4: new THREE.Euler(Math.PI, 0, 0), // -Y -> up
  5: new THREE.Euler(0, 0, Math.PI / 2), // +X -> up
  6: new THREE.Euler(Math.PI / 2, 0, 0), // -Z -> up
};

const Dice = forwardRef(({ onRollStart = () => {}, onRollComplete = () => {} }, ref) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeRef = useRef(null);
  const animRef = useRef({ running: false, raf: null });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    const container = containerRef.current;
    const width = 240;
    const height = 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 2.5, 2.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemi.position.set(0, 2, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    dir.castShadow = true;
    scene.add(dir);

    // create red face materials (we'll add hemispherical pips as separate meshes)
    const redColor = 0xE62E2D;
    const faceMat = new THREE.MeshStandardMaterial({ color: redColor, roughness: 0.4, metalness: 0.05 });
    const materials = [faceMat, faceMat, faceMat, faceMat, faceMat, faceMat];

    const geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);

    // cube base
    const cube = new THREE.Mesh(geo, materials);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    cubeRef.current = cube;

  // subtle ground
    const ground = new THREE.PlaneGeometry(6, 6);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x071021, roughness: 1 });
    const groundMesh = new THREE.Mesh(ground, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.6;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // initial rotation to show a pleasing angle
    cube.rotation.set(0.4, 0.8, 0.2);

    // create hemispherical pips similar to the original Zdog design
    const pipRadius = 0.07;
    const pipGeo = new THREE.SphereGeometry(pipRadius, 16, 12);
    const pipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.0 });

    const pipPositions = {
      1: [[0, 0]],
      2: [[-1, -1], [1, 1]],
      3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
      5: [[-1, -1], [-1, 1], [0, 0], [1, -1], [1, 1]],
      6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
    };

    const faceOffset = 0.5 + pipRadius * 0.2; // move pips slightly out of the face
    const gap = 0.22; // spacing multiplier for pips on face

    function addPipsToFace(faceIndex, value) {
      const positions = pipPositions[value] || [];
      const group = new THREE.Group();
      // align group to face
      switch (faceIndex) {
        case 0: // +X
          group.position.set(faceOffset, 0, 0);
          group.rotation.set(0, -Math.PI / 2, 0);
          break;
        case 1: // -X
          group.position.set(-faceOffset, 0, 0);
          group.rotation.set(0, Math.PI / 2, 0);
          break;
        case 2: // +Y (top)
          group.position.set(0, faceOffset, 0);
          group.rotation.set(-Math.PI / 2, 0, 0);
          break;
        case 3: // -Y (bottom)
          group.position.set(0, -faceOffset, 0);
          group.rotation.set(Math.PI / 2, 0, 0);
          break;
        case 4: // +Z
          group.position.set(0, 0, faceOffset);
          break;
        case 5: // -Z
          group.position.set(0, 0, -faceOffset);
          group.rotation.set(0, Math.PI, 0);
          break;
      }

      positions.forEach(p => {
        const x = p[0] * gap;
        const y = p[1] * gap;
        const m = new THREE.Mesh(pipGeo, pipMat);
        // sink the sphere halfway so it appears hemispherical on the face
        m.position.set(x, y, -pipRadius * 0.4);
        m.scale.y = 0.8; // slightly flattened to look like a hemisphere
        group.add(m);
      });
      cube.add(group);
    }

    // map conventional die numbers to faces so the visuals match typical dice
    // face indices: 0:+X(5),1:-X(2),2:+Y(3),3:-Y(4),4:+Z(1),5:-Z(6)
    addPipsToFace(4, 1);
    addPipsToFace(1, 2);
    addPipsToFace(2, 3);
    addPipsToFace(3, 4);
    addPipsToFace(0, 5);
    addPipsToFace(5, 6);

    // add OrbitControls for drag rotation like the previous Zdog dragRotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.rotateSpeed = 0.8;

    const clock = new THREE.Clock();
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      animRef.current.raf = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      // keep fixed size canvas; no-op, but keep resize handler in case later we want responsive
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current.raf);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      scene.traverse(obj => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.map?.dispose?.() || m.dispose?.());
          else obj.material.map?.dispose?.() || obj.material.dispose?.();
        }
      });
      controls.dispose();
      renderer.dispose();
    };
  }, [isClient]);

  useImperativeHandle(ref, () => ({
    roll: (forcedValue = null) => {
      if (!cubeRef.current || animRef.current.running) return;
      const cube = cubeRef.current;
      animRef.current.running = true;
      onRollStart();

      const result = forcedValue || Math.floor(Math.random() * 6) + 1;

      // start quaternion
      const fromQ = cube.quaternion.clone();

      // target orientation: bring face to up (+Y) using rotationsForFace
      const targetEuler = rotationsForFace[result].clone();

      // add random spins to make animation dynamic
      const spins = new THREE.Euler(
        Math.PI * (2 + Math.floor(Math.random() * 2)),
        Math.PI * (2 + Math.floor(Math.random() * 2)),
        Math.PI * (2 + Math.floor(Math.random() * 2))
      );

      // compose spins by converting to quaternion
      const spinQuat = new THREE.Quaternion().setFromEuler(spins);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
      targetQuat.multiply(spinQuat);

      const duration = 900 + Math.random() * 600; // ms
      const start = performance.now();

      const easeOut = t => 1 - Math.pow(1 - t, 3);

      const animate = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOut(t);
        // use instance slerp: copy the start quaternion then slerp towards target
        cube.quaternion.copy(fromQ).slerp(targetQuat, eased);
        if (t < 1) {
          animRef.current.raf = requestAnimationFrame(animate);
        } else {
          // finally set exact orientation for the face (no extra spins)
          cube.quaternion.copy(new THREE.Quaternion().setFromEuler(rotationsForFace[result]));
          animRef.current.running = false;
          onRollComplete(result);
        }
      };

      animRef.current.raf = requestAnimationFrame(animate);
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{ width: 240, height: 240, display: 'inline-block', cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onClick={() => {
        // if parent wants to control roll via GameControls, it will call ref.roll();
        // we still allow clicking the die to roll
        if (ref && typeof ref === 'object' && ref.current && ref.current.roll) ref.current.roll();
      }}
    />
  );
});

Dice.displayName = 'Dice';
export default Dice;
