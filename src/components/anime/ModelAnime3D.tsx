'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sparkles, Play, Pause, RotateCcw, Eye, Compass, Loader2 } from 'lucide-react';

interface ModelAnime3DProps {
  width?: number;
  height?: number;
  modelUrl?: string;
  animationUrl?: string;
  interactive?: boolean;
  onInteract?: () => void;
  className?: string;
}

// Bảng ánh xạ xương từ DeepMotion sang cấu trúc VRoid / MMD tiêu chuẩn
const VR_OID_BONE_MAP: Record<string, string> = {
  'hips_JNT': 'J_Bip_C_Hips',
  'spine_JNT': 'J_Bip_C_Spine',
  'spine1_JNT': 'J_Bip_C_Chest',
  'spine2_JNT': 'J_Bip_C_UpperChest',
  'neck_JNT': 'J_Bip_C_Neck',
  'head_JNT': 'J_Bip_C_Head',
  'l_shoulder_JNT': 'J_Bip_L_Shoulder',
  'l_arm_JNT': 'J_Bip_L_UpperArm',
  'l_forearm_JNT': 'J_Bip_L_LowerArm',
  'l_hand_JNT': 'J_Bip_L_Hand',
  'r_shoulder_JNT': 'J_Bip_R_Shoulder',
  'r_arm_JNT': 'J_Bip_R_UpperArm',
  'r_forearm_JNT': 'J_Bip_R_LowerArm',
  'r_hand_JNT': 'J_Bip_R_Hand',
  'l_upleg_JNT': 'J_Bip_L_UpperLeg',
  'l_leg_JNT': 'J_Bip_L_LowerLeg',
  'l_foot_JNT': 'J_Bip_L_Foot',
  'l_toebase_JNT': 'J_Bip_L_ToeBase',
  'r_upleg_JNT': 'J_Bip_R_UpperLeg',
  'r_leg_JNT': 'J_Bip_R_LowerLeg',
  'r_foot_JNT': 'J_Bip_R_Foot',
  'r_toebase_JNT': 'J_Bip_R_ToeBase',
};

/**
 * ModelAnime3D — Động cơ hiển thị Mô hình 3D Đa giác Full Polygon & Skeletal Animation
 * - Nạp trực tiếp file .glb (VRoid, Tripo3D, Meshy, Blender)
 * - Tự động liên kết và chuyển giao khung xương AnimationMixer (Retargeting)
 * - Điều khiển góc nhìn 360 độ (OrbitControls) mượt mà bằng chuột/ngón tay
 * - Tương tác thời gian thực: Tự động nghiêng đầu theo chuột (Gaze IK)
 */
export function ModelAnime3D({
  width = 280,
  height = 340,
  modelUrl = '/models/kawaii22.glb',
  animationUrl = '/models/motion.glb',
  interactive = true,
  onInteract,
  className = '',
}: ModelAnime3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlayingMotion, setIsPlayingMotion] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs điều khiển Three.js nội bộ
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationActionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const headBoneRef = useRef<THREE.Object3D | null>(null);

  // Chuyển giao các track chuyển động vào khung xương của mô hình
  const retargetClip = useCallback((clip: THREE.AnimationClip): THREE.AnimationClip => {
    const rawClip = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(clip));
    const retargetedTracks: THREE.KeyframeTrack[] = [];

    rawClip.tracks.forEach((track) => {
      const parts = track.name.split('.');
      const boneName = parts[0];
      const property = parts[1];

      // Nếu tên xương khớp trong map VRoid
      if (VR_OID_BONE_MAP[boneName]) {
        const mappedName = `${VR_OID_BONE_MAP[boneName]}.${property}`;
        retargetedTracks.push(new THREE.KeyframeTrack(mappedName, track.times, track.values.slice()));
      } else {
        // Giữ nguyên track nếu mô hình trùng tên xương
        retargetedTracks.push(track);
      }
    });

    return new THREE.AnimationClip(clip.name || 'retargeted_motion', clip.duration, retargetedTracks);
  }, []);

  // Khởi tạo Three.js Scene và nạp mô hình 3D
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    let animationFrameId: number;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 1.25, 2.5); // Góc nhìn vừa vặn từ ngực đến đầu
    cameraRef.current = camera;

    // 2. Renderer cao cấp với ToneMapping & Antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 4.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Không nhìn dưới đất
    controls.target.set(0, 1.1, 0); // Tập trung vào khuôn mặt nhân vật
    controlsRef.current = controls;

    // 4. Ánh sáng phong cách Anime Cel-Shading & Rimlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    // Đèn chính (Key Light)
    const keyLight = new THREE.DirectionalLight(0xfff1f2, 1.8);
    keyLight.position.set(2, 3, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Đèn viền xanh ngọc (Rim Light / Cyber glow)
    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // Đèn hồng hồ ly mềm mại (Fill Light)
    const fillLight = new THREE.PointLight(0xf43f5e, 1.5, 6);
    fillLight.position.set(0, 0.5, 1.5);
    scene.add(fillLight);

    // 5. Vòng ma trận sàn phát quang mềm mại
    const ringGeo = new THREE.RingGeometry(0.5, 0.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // 6. Nạp GLTF Loader
    const loader = new GLTFLoader();
    setIsLoading(true);

    const loadAll = async () => {
      try {
        // Kiểm tra xem có file mascot.glb riêng không, nếu không dùng model mặc định
        let finalModelUrl = modelUrl;
        try {
          const testRes = await fetch('/models/mascot.glb', { method: 'HEAD' });
          if (testRes.ok) {
            finalModelUrl = '/models/mascot.glb';
          }
        } catch {
          // Bỏ qua, dùng modelUrl mặc định
        }

        // Tải mô hình chính
        const gltf = await loader.loadAsync(
          finalModelUrl,
          (xhr) => {
            if (xhr.lengthComputable && isMounted) {
              setLoadProgress(Math.round((xhr.loaded / xhr.total) * 60));
            }
          }
        );

        if (!isMounted) return;

        const model = gltf.scene;
        modelGroupRef.current = model;

        // Căn chỉnh vị trí & tỷ lệ
        model.position.set(0, 0, 0);
        model.scale.set(1.0, 1.0, 1.0);

        // Bật bóng đổ cho tất cả mesh
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Tối ưu vật liệu anime
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.6;
              mat.metalness = 0.1;
            }
          }
          // Tìm xương đầu để tương tác dõi theo chuột
          if (child.name.includes('Head') || child.name.includes('head')) {
            headBoneRef.current = child;
          }
        });

        scene.add(model);

        // Khởi tạo AnimationMixer
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        // Nếu mô hình có sẵn animation (vd Tripo3D, Mixamo)
        if (gltf.animations && gltf.animations.length > 0) {
          gltf.animations.forEach((clip, index) => {
            const action = mixer.clipAction(clip);
            animationActionsRef.current[clip.name || `anim_${index}`] = action;
          });
          // Chơi animation đầu tiên
          const firstAction = Object.values(animationActionsRef.current)[0];
          if (firstAction) {
            firstAction.play();
            activeActionRef.current = firstAction;
            setIsPlayingMotion(true);
          }
        } else if (animationUrl) {
          // Nạp file motion ngoài
          try {
            const animGltf = await loader.loadAsync(
              animationUrl,
              (xhr) => {
                if (xhr.lengthComputable && isMounted) {
                  setLoadProgress(60 + Math.round((xhr.loaded / xhr.total) * 40));
                }
              }
            );

            if (animGltf.animations && animGltf.animations.length > 0) {
              const retargeted = retargetClip(animGltf.animations[0]);
              const action = mixer.clipAction(retargeted);
              animationActionsRef.current['dance'] = action;
            }
          } catch (animErr) {
            console.warn('Không thể nạp motion ngoài, nhân vật sẽ ở trạng thái tĩnh:', animErr);
          }
        }

        if (isMounted) {
          setIsLoading(false);
          setLoadProgress(100);
        }
      } catch (err) {
        console.error('Lỗi khi nạp mô hình 3D:', err);
        if (isMounted) {
          setHasError(true);
          setErrorMessage(err instanceof Error ? err.message : 'Không thể tải mô hình 3D');
          setIsLoading(false);
        }
      }
    };

    loadAll();

    // 7. Bắt tọa độ chuột để nghiêng đầu
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 8. Vòng lặp Render 60fps
    const clock = clockRef.current;
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Cập nhật AnimationMixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Cập nhật OrbitControls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Xoay nhẹ vòng ma trận sàn
      ringMesh.rotation.z = elapsedTime * 0.4;

      // Chuyển động thở procedural nhẹ nhàng nếu không phát motion múa
      if (modelGroupRef.current && !isPlayingMotion) {
        modelGroupRef.current.position.y = Math.sin(elapsedTime * 2.0) * 0.015;
        // Dõi theo chuột mượt mà
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

        if (headBoneRef.current) {
          headBoneRef.current.rotation.y = mouseRef.current.x * 0.35;
          headBoneRef.current.rotation.x = -mouseRef.current.y * 0.25;
        } else {
          modelGroupRef.current.rotation.y = mouseRef.current.x * 0.2;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 9. Dọn dẹp GPU sạch sẽ khi Component Unmount
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [width, height, modelUrl, animationUrl, interactive, retargetClip, isPlayingMotion]);

  // Bật / Dừng chuyển động múa
  const togglePlayMotion = () => {
    const danceAction = animationActionsRef.current['dance'] || Object.values(animationActionsRef.current)[0];
    if (!danceAction) return;

    if (isPlayingMotion) {
      danceAction.fadeOut(0.4);
      setTimeout(() => {
        danceAction.stop();
      }, 400);
      setIsPlayingMotion(false);
    } else {
      danceAction.reset().fadeIn(0.4).play();
      setIsPlayingMotion(true);
    }

    if (onInteract) onInteract();
  };

  // Đặt lại góc nhìn camera về mặt trước
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.25, 2.5);
      controlsRef.current.target.set(0, 1.1, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div
      className={`model-anime-3d-wrapper relative select-none ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Canvas Mount Container */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
        title="Kéo chuột để xoay nhân vật 360°, cuộn chuột để phóng to/thu nhỏ"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          <div className="relative mb-3 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <Sparkles className="w-4 h-4 absolute text-amber-400 animate-pulse" />
          </div>
          <div className="text-xs font-bold text-rose-300 tracking-wider">
            KHỞI TẠO 3D MESH... {loadProgress}%
          </div>
          <div className="w-32 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            zIndex: 10,
          }}
        >
          <span className="text-2xl mb-2">🏮</span>
          <div className="text-xs font-bold text-rose-400 mb-1">Không thể tải mô hình 3D</div>
          <p className="text-[10px] text-slate-400 max-w-[200px] mb-3">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[11px] px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-all"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Floating Control Bar */}
      {!isLoading && !hasError && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            zIndex: 5,
          }}
        >
          {/* Nút Bật/Dừng vũ đạo */}
          <button
            onClick={togglePlayMotion}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: isPlayingMotion
                ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
                : 'rgba(255, 255, 255, 0.1)',
            }}
            title={isPlayingMotion ? 'Dừng vũ đạo' : 'Phát vũ đạo 3D'}
          >
            {isPlayingMotion ? <Pause size={10} /> : <Play size={10} />}
            <span>{isPlayingMotion ? 'Dừng múa' : 'Vũ đạo'}</span>
          </button>

          {/* Nút Đặt lại góc nhìn */}
          <button
            onClick={resetCamera}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Đặt lại góc nhìn chính diện"
          >
            <RotateCcw size={11} />
          </button>

          {/* Huy hiệu 3D Orbit */}
          <span
            className="text-[9px] px-1.5 py-0.5 rounded text-rose-300/80 font-mono tracking-tighter"
            title="Xoay 360° tự do"
          >
            360°
          </span>
        </div>
      )}
    </div>
  );
}
