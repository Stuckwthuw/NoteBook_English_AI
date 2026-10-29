'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMascot } from '@/context/MascotContext';
import { Sparkles, MessageCircle, Minimize2, Maximize2, EyeOff, Heart } from 'lucide-react';

export function AnimeMascot() {
  const { emotion, message, isMascotVisible, isMinimized, interact, toggleVisibility, toggleMinimize } =
    useMascot();
  const [showBubble, setShowBubble] = useState(true);

  if (!isMascotVisible) {
    return (
      <button
        onClick={toggleVisibility}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          padding: '8px 14px',
          borderRadius: 20,
          background: 'var(--surface)',
          border: '1px solid var(--fox-ruby)',
          color: 'var(--fox-ruby)',
          boxShadow: '0 4px 20px rgba(244, 63, 94, 0.25)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
        }}
        title="Hiện Trợ lý Hồ Ly"
      >
        <span>🦊</span> Hiện Trợ lý
      </button>
    );
  }

  // Chế độ thu nhỏ (Mini badge)
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          onClick={interact}
          className="anime-breathe"
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(13, 148, 136, 0.2))',
            border: '2px solid var(--fox-ruby)',
            boxShadow: '0 0 16px rgba(244, 63, 94, 0.4)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            padding: 0,
          }}
          title="Nhấn để trò chuyện cùng Hồ Ly"
        >
          <Image
            src="/anime/mascot-transparent.png"
            alt="Anime Mascot"
            fill
            style={{ objectFit: 'cover', objectPosition: 'top center', transform: 'scale(1.4) translateY(4px)' }}
            priority
          />
        </button>

        <button
          onClick={toggleMinimize}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--muted-fg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Mở rộng nhân vật"
        >
          <Maximize2 size={13} />
        </button>
      </div>
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
        return 'rgba(244, 63, 94, 0.2)';
    }
  };

  // Class animation theo cảm xúc
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
    <aside
      aria-label="Trợ lý anime"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 20,
        zIndex: 998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none', // Cho phép click xuyên qua vùng trống
      }}
    >
      {/* Bong bóng thoại (Speech Bubble) */}
      {showBubble && message && (
        <div
          className="anime-bubble"
          style={{
            pointerEvents: 'auto',
            maxWidth: 260,
            marginBottom: 10,
            padding: '12px 16px',
            borderRadius: 18,
            background: 'rgba(26, 35, 50, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--fox-ruby)',
            boxShadow: `0 8px 30px ${getAuraColor()}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
            color: 'var(--fg)',
            fontSize: 13,
            lineHeight: 1.5,
            position: 'relative',
          }}
        >
          {/* Header mini của bong bóng */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--fox-ruby)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🦊</span> Bạch Hồ Ly
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setShowBubble(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: 10,
                  padding: 2,
                }}
                title="Ẩn lời thoại"
              >
                ✕
              </button>
            </div>
          </div>

          <p style={{ margin: 0, color: 'var(--fg)' }}>{message}</p>

          {/* Mũi tên bong bóng */}
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              right: 48,
              width: 12,
              height: 12,
              background: 'rgba(26, 35, 50, 0.92)',
              borderRight: '1px solid var(--fox-ruby)',
              borderBottom: '1px solid var(--fox-ruby)',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      {/* Nhân vật Anime Fox Girl */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {/* Nút điều khiển tiện ích nhỏ góc trên */}
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 0,
            display: 'flex',
            gap: 4,
            opacity: 0.85,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setShowBubble(!showBubble)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--muted-fg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={showBubble ? 'Tắt bong bóng thoại' : 'Mở bong bóng thoại'}
          >
            <MessageCircle size={11} />
          </button>
          <button
            onClick={toggleMinimize}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--muted-fg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Thu nhỏ nhân vật"
          >
            <Minimize2 size={11} />
          </button>
          <button
            onClick={toggleVisibility}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--muted-fg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Ẩn hoàn toàn nhân vật"
          >
            <EyeOff size={11} />
          </button>
        </div>

        {/* Hào quang Fox Spirit Glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: 170,
            height: 170,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getAuraColor()} 0%, transparent 70%)`,
            filter: 'blur(16px)',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'all 0.5s ease',
          }}
        />

        {/* Cánh hoa anh đào rơi xung quanh khi vui */}
        {(emotion === 'happy' || emotion === 'celebrate') && (
          <div style={{ position: 'absolute', inset: -20, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: '15%', top: '20%', fontSize: 16, animation: 'sakuraFloat 3s linear infinite' }}>🌸</span>
            <span style={{ position: 'absolute', left: '65%', top: '10%', fontSize: 13, animation: 'sakuraFloat 2.6s linear infinite 0.5s' }}>✨</span>
            <span style={{ position: 'absolute', left: '80%', top: '30%', fontSize: 15, animation: 'sakuraFloat 3.2s linear infinite 1s' }}>💖</span>
            <span style={{ position: 'absolute', left: '35%', top: '5%', fontSize: 14, animation: 'sakuraFloat 2.8s linear infinite 1.5s' }}>🌸</span>
          </div>
        )}

        {/* Đốm lửa ma trắc xanh ngọc khi idle/thinking */}
        {(emotion === 'idle' || emotion === 'thinking') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              style={{
                position: 'absolute',
                top: 30,
                left: 10,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--fox-spirit)',
                boxShadow: '0 0 12px var(--fox-spirit)',
                animation: 'foxSpiritOrb 3s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 70,
                right: 15,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--fox-ruby)',
                boxShadow: '0 0 10px var(--fox-ruby)',
                animation: 'foxSpiritOrb 2.5s ease-in-out infinite 1.2s',
              }}
            />
          </div>
        )}

        {/* Khung nhân vật có animation */}
        <div
          className={getAnimationClass()}
          onClick={interact}
          style={{
            width: 175,
            height: 220,
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 8px 24px ${getAuraColor()})`,
          }}
          title="Bấm vào Bạch Hồ Ly để tương tác"
        >
          <Image
            src="/anime/mascot-transparent.png"
            alt="Bạch Hồ Ly Anime Companion"
            fill
            sizes="175px"
            style={{
              objectFit: 'contain',
              objectPosition: 'bottom center',
              userSelect: 'none',
              pointerEvents: 'auto',
            }}
            priority
          />
        </div>

        {/* Nhãn tên nhỏ dưới chân */}
        <div
          onClick={interact}
          style={{
            marginTop: -6,
            padding: '3px 10px',
            borderRadius: 12,
            background: 'rgba(26, 35, 50, 0.85)',
            border: '1px solid var(--fox-ruby)',
            color: 'var(--fg)',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            zIndex: 3,
          }}
        >
          <span>🏮</span> Bạch Hồ Ly <Heart size={9} color="var(--fox-ruby)" fill="var(--fox-ruby)" />
        </div>
      </div>
    </aside>
  );
}
