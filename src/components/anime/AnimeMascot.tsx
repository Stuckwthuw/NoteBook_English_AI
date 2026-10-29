'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMascot } from '@/context/MascotContext';
import { Sparkles, MessageCircle, X, Heart, Volume2, Shield } from 'lucide-react';

export function AnimeMascot() {
  const { emotion, message, isMascotVisible, interact, toggleVisibility } = useMascot();
  const [isOpen, setIsOpen] = useState(false);

  if (!isMascotVisible) {
    return (
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          top: 14,
          right: 70,
          zIndex: 45,
          padding: '4px 10px',
          borderRadius: 16,
          background: 'rgba(26, 35, 50, 0.9)',
          border: '1px solid var(--fox-ruby)',
          color: 'var(--fox-ruby)',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          backdropFilter: 'blur(8px)',
        }}
        title="Mở Bùa Hộ Mệnh Hồ Ly"
      >
        <span>🏮</span> Trợ lý
      </button>
    );
  }

  // Ánh sáng hào quang tương ứng với cảm xúc
  const getAuraColor = () => {
    switch (emotion) {
      case 'happy':
        return 'rgba(244, 63, 94, 0.45)';
      case 'celebrate':
        return 'rgba(251, 191, 36, 0.6)';
      case 'thinking':
        return 'rgba(45, 212, 191, 0.5)';
      case 'encourage':
        return 'rgba(251, 191, 36, 0.4)';
      default:
        return 'rgba(244, 63, 94, 0.25)';
    }
  };

  const getAnimationClass = () => {
    switch (emotion) {
      case 'happy':
        return 'anime-happy';
      case 'celebrate':
        return 'anime-celebrate';
      case 'thinking':
        return 'anime-thinking';
      case 'encourage':
        return 'anime-encourage';
      default:
        return 'anime-breathe';
    }
  };

  return (
    <>
      {/* 
        ========================================================================
        1. OMAMORI CHARM DOCK (Gắn sát mép phải màn hình, KHÔNG CHE BẤT CỨ NÚT NÀO)
        - Cách xa đáy màn hình (> 120px) trên desktop
        - Không chiếm diện tích hay chặn thanh điều hướng
        ========================================================================
      */}
      <div
        className="anime-mascot-dock anime-mascot-desktop-dock"
        style={{
          position: 'fixed',
          right: 0,
          top: '42%',
          transform: 'translateY(-50%)',
          zIndex: 42,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {/* Nút bấm hình Bùa Hộ Mệnh Omamori Nhật Bản */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) interact();
          }}
          className="anime-breathe"
          style={{
            padding: '10px 8px 12px 12px',
            borderRadius: '16px 0 0 16px',
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.95) 0%, rgba(159, 18, 57, 0.92) 100%)',
            borderTop: '1px solid rgba(251, 191, 36, 0.5)',
            borderLeft: '1.5px solid rgba(251, 191, 36, 0.6)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.5)',
            borderRight: 'none',
            boxShadow: '-4px 6px 20px rgba(225, 29, 72, 0.4), inset 1px 1px 0 rgba(255,255,255,0.2)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: '#fff',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          title="Nhấn để trò chuyện cùng Bạch Hồ Ly"
        >
          {/* Avatar mini tròn viền vàng */}
          <div
            style={{
              position: 'relative',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '1.5px solid #fbbf24',
              overflow: 'hidden',
              background: '#0c1222',
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)',
            }}
          >
            <Image
              src="/anime/mascot-transparent.png"
              alt="Hồ Ly Avatar"
              fill
              sizes="34px"
              style={{ objectFit: 'cover', objectPosition: 'top center', transform: 'scale(1.5) translateY(3px)' }}
            />
          </div>

          {/* Chữ Katakana dọc phong cách Nhật Bản */}
          <div
            style={{
              writingMode: 'vertical-rl',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '2px',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            白狐 🏮 お守り
          </div>
        </button>
      </div>

      {/* 
        ========================================================================
        2. COMPANION MODAL / POPUP CARD (Chỉ mở ra khi người dùng click vào bùa)
        - Thiết kế như chiếc gương đền thần (Shinto Mirror Box)
        - Tuyệt đối không tự động che chắn giao diện làm việc
        ========================================================================
      */}
      {isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            zIndex: 150, // Nằm trên modal thông thường để tương tác
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="modal-content animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              width: '100%',
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(26, 35, 50, 0.96) 100%)',
              border: '1.5px solid rgba(244, 63, 94, 0.4)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(244, 63, 94, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {/* Header Thần Đạo Nhật Bản */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(244, 63, 94, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🏮</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Bạch Hồ Ly Tiên Cô</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: 'var(--fox-ruby)', color: 'white' }}>
                      Online
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                    「白狐の守護」 Thần thú đồng hành cùng bạn học tập
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--muted-fg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Khung trưng bày nhân vật & lời thoại */}
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Đốm lửa ma trắc hồ ly */}
              <div style={{ position: 'absolute', top: 20, left: 30, width: 8, height: 8, borderRadius: '50%', background: 'var(--fox-spirit)', boxShadow: '0 0 14px var(--fox-spirit)', animation: 'foxSpiritOrb 3s infinite' }} />
              <div style={{ position: 'absolute', top: 60, right: 30, width: 7, height: 7, borderRadius: '50%', background: 'var(--fox-ruby)', boxShadow: '0 0 12px var(--fox-ruby)', animation: 'foxSpiritOrb 2.6s infinite 1s' }} />

              {/* Nhân vật Bạch Hồ Ly lớn sắc nét */}
              <div
                className={getAnimationClass()}
                onClick={interact}
                style={{
                  position: 'relative',
                  width: 200,
                  height: 240,
                  cursor: 'pointer',
                  filter: `drop-shadow(0 12px 28px ${getAuraColor()})`,
                  transition: 'all 0.3s ease',
                  marginBottom: 16,
                }}
                title="Bấm vào Hồ Ly để đổi câu thoại"
              >
                <Image
                  src="/anime/mascot-transparent.png"
                  alt="Bạch Hồ Ly Companion"
                  fill
                  sizes="200px"
                  style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
                  priority
                />
              </div>

              {/* Bong bóng thoại sang trọng */}
              <div
                className="anime-bubble"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid var(--fox-ruby)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  textAlign: 'center',
                  position: 'relative',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{message}&rdquo;
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  onClick={interact}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--fox-crimson), #f43f5e)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                  }}
                >
                  <Sparkles size={14} />
                  Trò chuyện cùng Hồ Ly
                </button>

                <button
                  onClick={toggleVisibility}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--muted-fg)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  title="Ẩn hoàn toàn nhân vật"
                >
                  Ẩn bùa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
