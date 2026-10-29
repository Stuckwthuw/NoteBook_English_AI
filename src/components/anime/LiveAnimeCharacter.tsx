'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface LiveAnimeCharacterProps {
  width?: number;
  height?: number;
  showAura?: boolean;
  interactive?: boolean;
  onInteract?: () => void;
  priority?: boolean;
}

/**
 * LiveAnimeCharacter — Nhân vật Bạch Hồ Ly Sống Động
 * - Hệ thống nháy mắt tự nhiên (Natural Eye Blinking: Single & Double-blink)
 * - Hoạt ảnh nháy mắt tinh nghịch khi tương tác (Wink on Click)
 * - Vòng hào quang Thần Kính & Lửa Ma Trơi Thần Thú (Kitsune-bi)
 * - Hiệu ứng triệu hồi xuất hiện (Summoning Entrance Bloom)
 */
export function LiveAnimeCharacter({
  width = 240,
  height = 280,
  showAura = true,
  interactive = true,
  onInteract,
  priority = false,
}: LiveAnimeCharacterProps) {
  // Trạng thái mắt: 'open' (mở to), 'blink' (chớp nhắm cả 2 mắt), 'wink' (nháy 1 mắt)
  const [eyeState, setEyeState] = useState<'open' | 'blink' | 'wink'>('open');
  // Trạng thái tai khẽ động đậy
  const [earTwitching, setEarTwitching] = useState(false);
  // Trạng thái xuất hiện
  const [isEntering, setIsEntering] = useState(true);

  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hiệu ứng xuất hiện triệu hồi khi mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Chu kỳ sinh học nháy mắt tự nhiên
  const scheduleNextBlink = useCallback(() => {
    // Khoảng thời gian ngẫu nhiên giữa 2 lần chớp: 2.8s đến 5.2s
    const nextInterval = Math.random() * 2400 + 2800;

    blinkTimerRef.current = setTimeout(() => {
      // 15% xác suất xuất hiện nhịp chớp mắt kép (Double-blink) như người thật!
      const isDoubleBlink = Math.random() < 0.18;

      setEyeState('blink');

      setTimeout(() => {
        if (isDoubleBlink) {
          setEyeState('open');
          setTimeout(() => {
            setEyeState('blink');
            setTimeout(() => {
              setEyeState('open');
              scheduleNextBlink();
            }, 110);
          }, 90);
        } else {
          setEyeState('open');
          scheduleNextBlink();
        }
      }, 130); // Tốc độ khép mi: 130ms cực nhanh và tự nhiên
    }, nextInterval);
  }, []);

  useEffect(() => {
    scheduleNextBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [scheduleNextBlink]);

  // Chu kỳ giật tai nhẹ (Ear Twitch) ngẫu nhiên mỗi 7-10 giây
  useEffect(() => {
    const earInterval = setInterval(() => {
      setEarTwitching(true);
      setTimeout(() => setEarTwitching(false), 500);
    }, 8500);
    return () => clearInterval(earInterval);
  }, []);

  // Xử lý khi người dùng chạm hoặc click vào nhân vật -> Nháy mắt (Wink)
  const handleCharacterClick = () => {
    if (!interactive) return;

    // Nháy mắt tinh nghịch Wink trong 700ms
    setEyeState('wink');
    setTimeout(() => {
      setEyeState('open');
    }, 700);

    if (onInteract) {
      onInteract();
    }
  };

  // Lấy đường dẫn hình ảnh theo trạng thái mắt
  const currentImageSrc =
    eyeState === 'blink'
      ? '/anime/mascot-blink.png'
      : eyeState === 'wink'
      ? '/anime/mascot-wink.png'
      : '/anime/mascot-transparent.png';

  return (
    <div
      onClick={handleCharacterClick}
      className={`live-anime-character ${isEntering ? 'anime-summon-enter' : 'anime-breathe'} ${
        earTwitching ? 'ear-twitch' : ''
      }`}
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
      title={interactive ? 'Nhấp để tương tác cùng Bạch Hồ Ly (Nháy mắt tinh nghịch ✨)' : undefined}
    >
      {/* 
        ========================================================================
        1. VÒNG HÀO QUANG MA PHÁP THẦN KÍNH SHINTO (Xoay chậm)
        ========================================================================
      */}
      {showAura && (
        <>
          {/* Vòng ngoài xoay theo chiều kim đồng hồ */}
          <div
            style={{
              position: 'absolute',
              inset: -14,
              borderRadius: '50%',
              border: '1.5px dashed rgba(244, 63, 94, 0.45)',
              animation: 'spin 28s linear infinite',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.35))',
            }}
          />
          {/* Vòng trong xoay ngược chiều */}
          <div
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              animation: 'spin-reverse 20s linear infinite',
              pointerEvents: 'none',
            }}
          />
          {/* Lửa ma trơi Thần Thú (Kitsune-bi) trôi bồng bềnh */}
          <div
            className="kitsune-orb kitsune-orb-1"
            style={{
              position: 'absolute',
              top: '15%',
              left: '-8px',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #2dd4bf 0%, rgba(45,212,191,0) 70%)',
              filter: 'blur(2px)',
              boxShadow: '0 0 14px #2dd4bf',
              pointerEvents: 'none',
            }}
          />
          <div
            className="kitsune-orb kitsune-orb-2"
            style={{
              position: 'absolute',
              bottom: '25%',
              right: '-6px',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fb7185 0%, rgba(244,63,94,0) 70%)',
              filter: 'blur(2px)',
              boxShadow: '0 0 16px #f43f5e',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* 
        ========================================================================
        2. FRAME NHÂN VẬT CHÍNH (Đồng bộ nháy mắt cực mượt)
        - Khi chớp mắt: chuyển tức thì giữa mắt mở <-> nhắm <-> nháy mắt
        ========================================================================
      */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          filter: isEntering
            ? 'brightness(1.5) blur(4px) drop-shadow(0 0 24px rgba(244, 63, 94, 0.8))'
            : eyeState === 'wink'
            ? 'drop-shadow(0 8px 24px rgba(251, 191, 36, 0.55))'
            : 'drop-shadow(0 8px 20px rgba(244, 63, 94, 0.35))',
          transition: 'filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Image
          src={currentImageSrc}
          alt="Bạch Hồ Ly Tiên Cô"
          fill
          sizes={`${width}px`}
          style={{
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transition: 'transform 0.15s ease-out',
          }}
          priority={priority}
        />
      </div>

      {/* Biểu tượng trái tim / ngôi sao bay lên khi nháy mắt Wink */}
      {eyeState === 'wink' && (
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            fontSize: 22,
            filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.8))',
            pointerEvents: 'none',
            animation: 'slideUpFade 0.7s forwards',
          }}
        >
          💖
        </div>
      )}
    </div>
  );
}

