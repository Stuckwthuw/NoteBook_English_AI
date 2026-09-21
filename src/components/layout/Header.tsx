'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 0',
        marginBottom: 8,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--fg)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>

      {mounted && (
        <button
          onClick={toggleTheme}
          style={{
            width: 40,
            height: 40,
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
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
    </header>
  );
}
