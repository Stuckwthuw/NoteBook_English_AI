'use client';

import React from 'react';
import { CEFR_LEVELS } from '@/lib/types';

export function CEFRBadge({ level, size = 'md' }: { level: string; size?: 'sm' | 'md' | 'lg' }) {
  const config = CEFR_LEVELS[level] || CEFR_LEVELS['B1'];

  const sizeStyles = {
    sm: { fontSize: 10, padding: '2px 8px', borderRadius: 6 },
    md: { fontSize: 12, padding: '3px 10px', borderRadius: 8 },
    lg: { fontSize: 14, padding: '4px 14px', borderRadius: 10 },
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <span
      style={{
        ...sizeStyles[size],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
        color: config.color,
        background: isDark ? `${config.color}18` : config.bgColor,
        border: `1px solid ${config.color}30`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.color }} />
      {level}
    </span>
  );
}
