'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Brain, Search, Flame } from 'lucide-react';
import { useMascot } from '@/context/MascotContext';
import { triggerSakuraShower } from '@/lib/confetti';
import { ThreeAnimeCharacter } from './ThreeAnimeCharacter';

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
        padding: '22px 24px',
        marginBottom: 24,
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 20, 35, 0.92) 100%)',
        border: '1.5px solid rgba(244, 63, 94, 0.25)',
        boxShadow: '0 12px 36px rgba(244, 63, 94, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Background Anime Aura Glow */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: 20,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(45, 212, 191, 0.12) 60%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Left Column: Greeting & Stats & Actions */}
        <div style={{ minWidth: 0 }}>
          {/* Badge Triện đỏ Thần Đạo Nhật Bản */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--fox-ruby)',
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: '0.5px',
            }}
          >
            <span>🏮</span> 白狐の加護 • BẠCH HỒ LY ĐỒNG HÀNH
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: 6,
              letterSpacing: '-0.02em',
            }}
          >
            Chào mừng trở lại, <span style={{ color: 'var(--fox-ruby)', textShadow: '0 0 14px rgba(244,63,94,0.45)' }}>Học giả!</span>
          </h1>

          <p style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.5, marginBottom: 14 }}>
            Hôm nay có <strong style={{ color: 'var(--fox-gold)' }}>{needReviewWords} từ cần ôn tập</strong> và{' '}
            <strong style={{ color: 'var(--primary)' }}>{masteredWords} từ đã thuộc</strong> trong tổng số {totalWords} từ.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              href="/review"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--fox-crimson), #f43f5e)',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              <Brain size={14} />
              Ôn tập ngay
            </Link>

            <Link
              href="/lookup"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 12,
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                color: 'var(--primary)',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              <Search size={14} />
              Tra từ AI
            </Link>
          </div>
        </div>

        {/* Right Column: Nhân vật Bạch Hồ Ly 3D WebGL (Độ sâu Z-depth & Nghiêng đầu 3D theo chuột) */}
        <div style={{ flexShrink: 0 }}>
          <ThreeAnimeCharacter
            width={115}
            height={130}
            interactive={true}
            onInteract={() => {
              triggerSakuraShower();
              interact();
            }}
          />
        </div>
      </div>
    </div>
  );
}
