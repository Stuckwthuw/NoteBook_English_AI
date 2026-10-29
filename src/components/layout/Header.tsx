'use client';

import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useMascot } from '@/context/MascotContext';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { interact } = useMascot();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0 16px',
        marginBottom: 8,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--fox-ruby)', letterSpacing: '1px' }}>
            「スマート辞書」
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7 }}>• NoteBook AI</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--fg)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Nút gọi nhanh Bạch Hồ Ly trên Header */}
        <button
          onClick={interact}
          style={{
            height: 38,
            padding: '0 12px',
            borderRadius: 12,
            border: '1px solid rgba(244, 63, 94, 0.35)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--fox-ruby)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 10px rgba(244, 63, 94, 0.12)',
            transition: 'all 0.2s',
          }}
          title="Trò chuyện với Bạch Hồ Ly"
        >
          <span>🦊</span>
          <span style={{ display: 'none' }} className="sm:inline">Hồ Ly</span>
        </button>

        {mounted && (
          <button
            onClick={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-fg)',
              transition: 'all 0.2s',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}
      </div>
    </header>
  );
}
