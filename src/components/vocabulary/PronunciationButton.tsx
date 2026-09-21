'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { usePronunciation } from '@/hooks/usePronunciation';

export function PronunciationButton({
  word,
  compact = false,
}: {
  word: string;
  compact?: boolean;
}) {
  const { speak, speaking, accent, setAccent, available } = usePronunciation();

  if (!available) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => speak(word)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '4px 8px' : '6px 12px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          background: speaking ? 'var(--primary-soft)' : 'var(--surface)',
          cursor: 'pointer',
          color: speaking ? 'var(--primary)' : 'var(--muted-fg)',
          fontSize: 13,
          transition: 'all 0.2s',
        }}
        title="Phát âm"
      >
        {speaking ? (
          <div className="sound-wave">
            <span /><span /><span /><span />
          </div>
        ) : (
          <Volume2 size={compact ? 14 : 16} />
        )}
        {!compact && <span>{accent}</span>}
      </button>

      {!compact && (
        <button
          onClick={() => setAccent(accent === 'US' ? 'UK' : 'US')}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            background: 'var(--surface)',
            cursor: 'pointer',
            fontSize: 11,
            color: 'var(--muted-fg)',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          title={`Chuyển sang ${accent === 'US' ? 'UK' : 'US'}`}
        >
          {accent === 'US' ? '🇺🇸→🇬🇧' : '🇬🇧→🇺🇸'}
        </button>
      )}
    </div>
  );
}
