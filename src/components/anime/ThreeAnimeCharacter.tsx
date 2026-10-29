'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeAnimeCharacterProps {
  width?: number;
  height?: number;
  interactive?: boolean;
  onInteract?: () => void;
  priority?: boolean;
}

/**
 * ThreeAnimeCharacter — Trình kết xuất 3D WebGL Siêu Cấp cho Bạch Hồ Ly
 * - Sử dụng Three.js Vertex & Fragment Shader với Bản đồ Độ Sâu 3D (Z-Displacement Map)
 * - Tương tác 3D: Nghiêng đầu và mắt dõi theo con trỏ chuột trong không gian 3D thực tế
 * - Chu kỳ chớp mắt (Blink) và nháy mắt (Wink) mượt mà bằng WebGL Texture Blending
 * - Cánh hoa Sakura và Lửa Thần Thú (Kitsune-bi) bay lượn ở các tầng Z-depth khác nhau
 * - Ánh sáng động (Dynamic Specular & Rim Lighting)
 */
export function ThreeAnimeCharacter({
  width = 240,
  height = 290,
  interactive = true,
  onInteract,
}: ThreeAnimeCharacterProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWinking, setIsWinking] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  // References to communicate with the render loop without re-triggering effects
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const blinkFactorRef = useRef(0);
  const winkFactorRef = useRef(0);
  const isInteractingRef = useRef(false);

  // Biological eye blinking loop
  const scheduleBlink = useCallback(() => {
    const nextInterval = Math.random() * 2500 + 2800; // 2.8s to 5.3s
    return setTimeout(() => {
      const isDouble = Math.random() < 0.2;
      blinkFactorRef.current = 1.0;

      setTimeout(() => {
        blinkFactorRef.current = 0.0;
        if (isDouble) {
          setTimeout(() => {
            blinkFactorRef.current = 1.0;
            setTimeout(() => {
              blinkFactorRef.current = 0.0;
              scheduleBlink();
            }, 110);
          }, 90);
        } else {
          scheduleBlink();
        }
      }, 130);
    }, nextInterval);
  }, []);

  useEffect(() => {
    const timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, [scheduleBlink]);

  // Click / Tap -> Wink in 3D
  const handleInteraction = () => {
    if (!interactive || isInteractingRef.current) return;
    isInteractingRef.current = true;
    setIsWinking(true);
    winkFactorRef.current = 1.0;

    setTimeout(() => {
      winkFactorRef.current = 0.0;
      setIsWinking(false);
      isInteractingRef.current = false;
    }, 800);

    if (onInteract) {
      onInteract();
    }
  };

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D mode:', e);
      setWebGLError(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 3.6;

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    const textureOpen = textureLoader.load('/anime/mascot-transparent.png');
    const textureBlink = textureLoader.load('/anime/mascot-blink.png');
    const textureWink = textureLoader.load('/anime/mascot-wink.png');
    const depthMap = textureLoader.load('/anime/mascot-depth.png');

    [textureOpen, textureBlink, textureWink, depthMap].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
    });

    // Custom 3D Depth-Displaced Shader Material
    const planeGeo = new THREE.PlaneGeometry(2.35, 2.7, 64, 64);

    const uniforms = {
      uTextureOpen: { value: textureOpen },
      uTextureBlink: { value: textureBlink },
      uTextureWink: { value: textureWink },
      uDepthMap: { value: depthMap },
      uBlinkFactor: { value: 0.0 },
      uWinkFactor: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0.0 },
    };

    const vertexShader = `
      uniform sampler2D uDepthMap;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        vUv = uv;
        float depth = texture2D(uDepthMap, uv).r;
        vDepth = depth;

        vec3 newPos = position;
        // 3D Depth displacement along Z axis (closer parts push forward)
        newPos.z += depth * 0.42;

        // Subtle organic breathing motion
        float breath = sin(uTime * 2.2) * 0.02 * depth;
        newPos.y += breath;
        newPos.x += cos(uTime * 1.6) * 0.01 * depth;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTextureOpen;
      uniform sampler2D uTextureBlink;
      uniform sampler2D uTextureWink;
      uniform sampler2D uDepthMap;
      uniform float uBlinkFactor;
      uniform float uWinkFactor;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        // Parallax mapping: shift texture coordinate based on 3D gaze and depth
        vec2 parallax = uMouse * (vDepth * 0.038);
        vec2 uv = clamp(vUv + parallax, 0.001, 0.999);

        vec4 colorOpen = texture2D(uTextureOpen, uv);
        vec4 colorBlink = texture2D(uTextureBlink, uv);
        vec4 colorWink = texture2D(uTextureWink, uv);

        // Blend eye frames seamlessly in WebGL
        vec4 baseColor = mix(colorOpen, colorBlink, clamp(uBlinkFactor, 0.0, 1.0));
        baseColor = mix(baseColor, colorWink, clamp(uWinkFactor, 0.0, 1.0));

        if (baseColor.a < 0.02) discard;

        // Dynamic 3D lighting reflection following the cursor
        vec2 lightDir = normalize(uMouse - (vUv - 0.5) * 2.0);
        float rim = pow(vDepth, 2.0) * 0.12;
        float spec = pow(max(0.0, 1.0 - length(uMouse * 1.4 - (vUv - 0.5) * 2.0)), 3.0) * vDepth * 0.25;

        // Ambient Kitsune aura tint
        vec3 finalRgb = baseColor.rgb + vec3(0.05, 0.02, 0.04) * rim + vec3(0.12, 0.08, 0.1) * spec;

        gl_FragColor = vec4(finalRgb, baseColor.a);
      }
    `;

    const characterMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const characterMesh = new THREE.Mesh(planeGeo, characterMaterial);
    scene.add(characterMesh);

    // 3D Orbiting Kitsune Spirit Flame Orbs in World Space
    const orbGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const orbMat1 = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const orbMat2 = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const orb1 = new THREE.Mesh(orbGeometry, orbMat1);
    const orb2 = new THREE.Mesh(orbGeometry, orbMat2);
    scene.add(orb1);
    scene.add(orb2);

    // 3D Sakura Petals Floating in Depth
    const petalCount = 28;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 3.5;
      petalPositions[i * 3 + 1] = Math.random() * 3.5 - 1.5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      petalVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: -(Math.random() * 0.012 + 0.008),
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xfb7185,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);

    // Mouse / Touch Tracking Handlers
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Normalized coordinates [-1, 1]
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.targetX = Math.max(-1, Math.min(1, nx));
      mouseRef.current.targetY = Math.max(-1, Math.min(1, ny));
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('touchend', handlePointerLeave);

    // Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // 3D Mesh Rotation & Head Tilt towards cursor
      characterMesh.rotation.y = mouseRef.current.x * 0.28;
      characterMesh.rotation.x = -mouseRef.current.y * 0.2;

      // Update Shader Uniforms
      uniforms.uTime.value = elapsedTime;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      uniforms.uBlinkFactor.value += (blinkFactorRef.current - uniforms.uBlinkFactor.value) * 0.35;
      uniforms.uWinkFactor.value += (winkFactorRef.current - uniforms.uWinkFactor.value) * 0.25;

      // Orbiting Spirit Flame Orbs in 3D
      const orbRadius = 1.35;
      orb1.position.x = Math.cos(elapsedTime * 1.5) * orbRadius;
      orb1.position.z = Math.sin(elapsedTime * 1.5) * 0.6 + 0.2;
      orb1.position.y = Math.sin(elapsedTime * 2.2) * 0.35 + 0.1;

      orb2.position.x = Math.cos(elapsedTime * 1.2 + Math.PI) * orbRadius;
      orb2.position.z = Math.sin(elapsedTime * 1.2 + Math.PI) * 0.6 + 0.2;
      orb2.position.y = Math.cos(elapsedTime * 1.8) * 0.35 - 0.2;

      // Update 3D Sakura Petals
      const positions = petalGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        positions[i * 3] += petalVelocities[i].x;
        positions[i * 3 + 1] += petalVelocities[i].y;
        positions[i * 3 + 2] += petalVelocities[i].z;

        // Reset if fell below bottom
        if (positions[i * 3 + 1] < -1.8) {
          positions[i * 3 + 1] = 1.8;
          positions[i * 3] = (Math.random() - 0.5) * 3.5;
        }
      }
      petalGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('touchend', handlePointerLeave);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      characterMaterial.dispose();
      orbGeometry.dispose();
      orbMat1.dispose();
      orbMat2.dispose();
      petalGeo.dispose();
      petalMat.dispose();
    };
  }, [width, height, interactive]);

  if (webGLError) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={isWinking ? '/anime/mascot-wink.png' : '/anime/mascot-transparent.png'}
          alt="Bạch Hồ Ly"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleInteraction}
      style={{
        position: 'relative',
        width,
        height,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      title={interactive ? 'Dê chuột để xoay 3D • Nhấp để Bạch Hồ Ly nháy mắt (Wink ✨)' : undefined}
    >
      {/* Three.js 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Love Heart on 3D Wink */}
      {isWinking && (
        <div
          style={{
            position: 'absolute',
            top: '18%',
            right: '18%',
            fontSize: 26,
            filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.9))',
            pointerEvents: 'none',
            animation: 'slideUpFade 0.75s forwards',
          }}
        >
          💖
        </div>
      )}
    </div>
  );
}
