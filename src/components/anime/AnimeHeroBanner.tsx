'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Brain, Search, Flame } from 'lucide-react';
import { useMascot } from '@/context/MascotContext';

interface AnimeHeroBannerProps {
  totalWords: number;
  masteredWords: number;
  needReviewWords: number;
}

export function AnimeHeroBanner({ totalWords, masteredWords, needReviewWords }: AnimeHeroBannerProps) {
  const { interact } = useMascot();

  return (
    <div
      className="glass-card animate-scale-in"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '24px 28px',
        marginBottom: 24,
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(30, 20, 35, 0.9) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.25)',
        boxShadow: '0 8px 32px rgba(244, 63, 94, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background Anime Aura Glow */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: 40,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(45, 212, 191, 0.15) 50%, transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Sakura Petals background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: 12, right: 280, fontSize: 18, animation: 'sakuraFloat 4s linear infinite', opacity: 0.6 }}>🌸</span>
        <span style={{ position: 'absolute', top: 60, right: 80, fontSize: 14, animation: 'sakuraFloat 5s linear infinite 1.5s', opacity: 0.7 }}>🌸</span>
        <span style={{ position: 'absolute', top: 110, right: 200, fontSize: 12, animation: 'sakuraFloat 3.8s linear infinite 0.8s', opacity: 0.5 }}>✨</span>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        {/* Left: Text & Actions */}
        <div style={{ flex: '1 1 320px', maxWidth: 500 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--fox-ruby)',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            <span>🏮</span> Bạch Hồ Ly Đồng Hành
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--fg)',
              lineHeight: 1.3,
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Chào mừng trở lại, <span style={{ color: 'var(--fox-ruby)', textShadow: '0 0 16px rgba(244,63,94,0.4)' }}>Học giả!</span>
          </h1>

          <p style={{ fontSize: 13, color: 'var(--muted-fg)', lineHeight: 1.5, marginBottom: 16 }}>
            Hôm nay bạn có <strong style={{ color: 'var(--fox-gold)' }}>{needReviewWords} từ cần ôn tập</strong> và{' '}
            <strong style={{ color: 'var(--primary)' }}>{masteredWords} từ đã thuộc</strong> trong tổng số {totalWords} từ. Cùng thiếp rèn luyện phản xạ nhé!
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/review"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--fox-crimson), #f43f5e)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(225, 29, 72, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              <Brain size={16} />
              Ôn tập cùng Hồ Ly
            </Link>

            <Link
              href="/lookup"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 12,
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                color: 'var(--primary)',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <Search size={15} />
              Tra từ AI
            </Link>
          </div>
        </div>

        {/* Right: Anime Fox Girl Mascot */}
        <div
          onClick={interact}
          className="anime-breathe"
          style={{
            position: 'relative',
            width: 170,
            height: 200,
            cursor: 'pointer',
            flexShrink: 0,
            filter: 'drop-shadow(0 10px 24px rgba(244, 63, 94, 0.35))',
          }}
          title="Nhấn để trò chuyện cùng Bạch Hồ Ly"
        >
          <Image
            src="/anime/mascot-transparent.png"
            alt="Bạch Hồ Ly"
            fill
            sizes="170px"
            style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
