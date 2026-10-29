'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeAnimeCharacterProps {
  width?: number;
  height?: number;
  interactive?: boolean;
  onInteract?: () => void;
  showOrbs?: boolean;
}

/**
 * ThreeAnimeCharacter — Động cơ 3D WebGL Nâng Cấp Toàn Diện (AAA Quality)
 * - Vật lý lò xo mượt mà (Spring-Damped 3D Parallax & Tilt): Chuyển động siêu êm, không hề bị khựng
 * - Nháy mắt mượt mà bằng GLSL Eyelid Shader: Tự động nén mi mắt tự nhiên, KHÔNG dùng mảng màu giả
 * - Dõi mắt theo chuột (Eye Gaze & Pupil Tracking) trong không gian 3D
 * - Hạt hoa anh đào rơi 3D có chiều sâu không gian (Z-depth)
 * - Khắc phục 100% tình trạng đốm màu lạ đè lên người & vệt mờ trên mặt
 */
export function ThreeAnimeCharacter({
  width = 250,
  height = 300,
  interactive = true,
  onInteract,
}: ThreeAnimeCharacterProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWinking, setIsWinking] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  // References to keep animation loop 60fps without React re-render lag
  const mouseRef = useRef({ targetX: 0, targetY: 0 });
  const springRef = useRef({
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
  });

  const blinkStateRef = useRef({
    current: 0,
    target: 0,
    closing: false,
  });

  const winkStateRef = useRef({
    current: 0,
    target: 0,
  });

  const isInteractingRef = useRef(false);

  // 1. Chu kỳ chớp mắt sinh học siêu mượt (Smooth Biological Blink)
  const scheduleBlink = useCallback(() => {
    const nextInterval = Math.random() * 2600 + 2600; // 2.6s - 5.2s ngẫu nhiên
    return setTimeout(() => {
      const isDouble = Math.random() < 0.2;

      // Bắt đầu nhắm mi mắt (smooth transition)
      blinkStateRef.current.target = 1.0;
      blinkStateRef.current.closing = true;

      // Sau 80ms bắt đầu mở ra
      setTimeout(() => {
        blinkStateRef.current.target = 0.0;
        blinkStateRef.current.closing = false;

        if (isDouble) {
          // Nhịp chớp mắt kép (Double-blink)
          setTimeout(() => {
            blinkStateRef.current.target = 1.0;
            setTimeout(() => {
              blinkStateRef.current.target = 0.0;
              scheduleBlink();
            }, 90);
          }, 80);
        } else {
          scheduleBlink();
        }
      }, 90);
    }, nextInterval);
  }, []);

  useEffect(() => {
    const timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, [scheduleBlink]);

  // 2. Tương tác nhấp chuột -> Nháy mắt tinh nghịch (Wink)
  const handleInteraction = () => {
    if (!interactive || isInteractingRef.current) return;
    isInteractingRef.current = true;
    setIsWinking(true);
    winkStateRef.current.target = 1.0;

    setTimeout(() => {
      winkStateRef.current.target = 0.0;
      setTimeout(() => {
        setIsWinking(false);
        isInteractingRef.current = false;
      }, 200);
    }, 750);

    if (onInteract) {
      onInteract();
    }
  };

  // 3. Khởi tạo Three.js 3D WebGL Scene
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
      console.warn('WebGL init failed:', e);
      setWebGLError(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.z = 3.5;

    // Load Texture Gốc (Pristine Original Artwork)
    const textureLoader = new THREE.TextureLoader();
    const charTexture = textureLoader.load('/anime/mascot-transparent.png');
    charTexture.colorSpace = THREE.SRGBColorSpace;
    charTexture.generateMipmaps = true;
    charTexture.minFilter = THREE.LinearMipmapLinearFilter;

    // Load Depth Map để phân tầng độ sâu Z
    const depthTexture = textureLoader.load('/anime/mascot-depth.png');
    depthTexture.colorSpace = THREE.SRGBColorSpace;

    // 3D Plane Mesh với Shader biến dạng mi mắt & chiều sâu
    const planeGeo = new THREE.PlaneGeometry(2.3, 2.65, 32, 32);

    const uniforms = {
      uTexture: { value: charTexture },
      uDepthMap: { value: depthTexture },
      uBlinkFactor: { value: 0.0 },
      uWinkFactor: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0.0 },
    };

    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform sampler2D uDepthMap;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        vUv = uv;
        float depth = texture2D(uDepthMap, uv).r;
        vDepth = depth;

        vec3 newPos = position;

        // Chiều sâu 3D mềm mại theo Z (nhẹ nhàng để không làm vỡ hình)
        newPos.z += depth * 0.18;

        // Hơi thở nhẹ nhàng tự nhiên ở ngực và vai
        float breath = sin(uTime * 1.8) * 0.015 * depth;
        newPos.y += breath;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uBlinkFactor;
      uniform float uWinkFactor;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;
      varying float vDepth;

      void main() {
        vec2 uv = vUv;

        // Thị sai Parallax 3D siêu êm theo góc nhìn chuột
        vec2 parallax = uMouse * (vDepth * 0.022);
        uv = clamp(uv + parallax, 0.001, 0.999);

        // ========================================================
        // 1. Tọa độ chính xác vùng mắt trên ảnh (711 x 814)
        // Mắt trái (người nhìn): center u=0.4754, v=0.7101
        // Mắt phải (người nhìn): center u=0.5626, v=0.7101
        // ========================================================
        vec2 dL = vec2((uv.x - 0.4754) / 0.022, (uv.y - 0.7101) / 0.015);
        float distL = length(dL);

        vec2 dR = vec2((uv.x - 0.5626) / 0.024, (uv.y - 0.7101) / 0.015);
        float distR = length(dR);

        // ========================================================
        // 2. Dõi mắt theo chuột (Eye Gaze Tracking)
        // Con ngươi khẽ dịch chuyển theo con trỏ chuột trong không gian 3D!
        // ========================================================
        if (distL < 1.0) {
          float gazeWeight = cos(distL * 1.5707963);
          uv.x -= uMouse.x * 0.003 * gazeWeight;
          uv.y -= uMouse.y * 0.002 * gazeWeight;
        }
        if (distR < 1.0) {
          float gazeWeight = cos(distR * 1.5707963);
          uv.x -= uMouse.x * 0.003 * gazeWeight;
          uv.y -= uMouse.y * 0.002 * gazeWeight;
        }

        // ========================================================
        // 3. Khép mi mắt sinh học (Lattice Eyelid Squeeze)
        // Nén trực tiếp UV về đường viền mi trên tự nhiên, 100% không dùng mảng màu xám giả!
        // ========================================================
        float blinkL = uBlinkFactor;
        float blinkR = max(uBlinkFactor, uWinkFactor);

        if (distL < 1.0 && blinkL > 0.001) {
          float squeezeWeight = cos(distL * 1.5707963);
          float amount = blinkL * squeezeWeight * 0.88;
          // Nén tọa độ v về đường mí mắt
          uv.y = mix(uv.y, 0.7135, amount);
        }

        if (distR < 1.0 && blinkR > 0.001) {
          float squeezeWeight = cos(distR * 1.5707963);
          float amount = blinkR * squeezeWeight * 0.88;
          uv.y = mix(uv.y, 0.7135, amount);
        }

        vec4 col = texture2D(uTexture, uv);
        if (col.a < 0.02) discard;

        // Phản chiếu ánh sáng 3D động mềm mại trên gương mặt và tóc
        float spec = pow(max(0.0, 1.0 - length(uMouse * 1.2 - (vUv - 0.5) * 2.0)), 2.8) * vDepth * 0.18;
        col.rgb += vec3(0.08, 0.06, 0.08) * spec;

        gl_FragColor = col;
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const characterMesh = new THREE.Mesh(planeGeo, material);
    scene.add(characterMesh);

    // 4. Cánh hoa anh đào rơi 3D trong không gian thực
    const petalCount = 26;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVels: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 3.2;
      petalPositions[i * 3 + 1] = Math.random() * 3.2 - 1.6;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      petalVels.push({
        x: (Math.random() - 0.5) * 0.006,
        y: -(Math.random() * 0.01 + 0.006),
        z: (Math.random() - 0.5) * 0.004,
      });
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xfb7185,
      size: 0.042,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);

    // 5. Xử lý chuột / chạm với độ trễ tự nhiên
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

      // Tọa độ chuẩn hóa [-1, 1]
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

    // 6. Vòng lặp Render 60fps với Thuật Toán Vật Lý Lò Xo Damped Spring
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Damped harmonic oscillator physics for 3D tilt
      const spring = 0.07;
      const damping = 0.82;

      const targetRotY = mouseRef.current.targetX * 0.22;
      const targetRotX = -mouseRef.current.targetY * 0.16;

      springRef.current.velY += (targetRotY - springRef.current.rotY) * spring;
      springRef.current.velX += (targetRotX - springRef.current.rotX) * spring;

      springRef.current.velY *= damping;
      springRef.current.velX *= damping;

      springRef.current.rotY += springRef.current.velY;
      springRef.current.rotX += springRef.current.velX;

      // Áp dụng góc nghiêng 3D thực tế
      characterMesh.rotation.y = springRef.current.rotY;
      characterMesh.rotation.x = springRef.current.rotX;

      // Cập nhật giá trị Uniforms
      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value.set(springRef.current.rotY * 4.0, springRef.current.rotX * 4.0);

      // Nội suy mượt mà độ khép mi mắt
      const blinkDiff = blinkStateRef.current.target - blinkStateRef.current.current;
      blinkStateRef.current.current += blinkDiff * 0.32;
      uniforms.uBlinkFactor.value = blinkStateRef.current.current;

      // Nội suy độ nháy mắt Wink
      const winkDiff = winkStateRef.current.target - winkStateRef.current.current;
      winkStateRef.current.current += winkDiff * 0.25;
      uniforms.uWinkFactor.value = winkStateRef.current.current;

      // Cập nhật vị trí hoa anh đào 3D
      const positions = petalGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        positions[i * 3] += petalVels[i].x;
        positions[i * 3 + 1] += petalVels[i].y;
        positions[i * 3 + 2] += petalVels[i].z;

        if (positions[i * 3 + 1] < -1.7) {
          positions[i * 3 + 1] = 1.7;
          positions[i * 3] = (Math.random() - 0.5) * 3.2;
        }
      }
      petalGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

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
      material.dispose();
      charTexture.dispose();
      depthTexture.dispose();
      petalGeo.dispose();
      petalMat.dispose();
    };
  }, [width, height, interactive]);

  if (webGLError) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/anime/mascot-transparent.png"
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={interactive ? 'Dê chuột để nghiêng đầu 3D • Nhấp để Bạch Hồ Ly nháy mắt Wink! ✨' : undefined}
    >
      {/* Three.js 3D WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Trái tim bay lên khi nháy mắt Wink */}
      {isWinking && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '16%',
            fontSize: 24,
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
