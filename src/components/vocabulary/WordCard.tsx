'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Circle,
  BookOpen,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import type { VocabularyEntry } from '@/lib/types';
import { CEFRBadge } from './CEFRBadge';
import { PronunciationButton } from './PronunciationButton';

interface WordCardProps {
  entry: VocabularyEntry;
  onDelete?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
  compact?: boolean;
}

export function WordCard({ entry, onDelete, onToggleMastered, compact = false }: WordCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'collocations' | 'contexts' | 'pitfalls'>('contexts');

  return (
    <div
      className="glass-card animate-slide-up"
      style={{
        padding: compact ? 16 : 20,
        cursor: compact ? 'pointer' : 'default',
      }}
      onClick={() => compact && setExpanded(!expanded)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? 18 : 22,
                fontWeight: 700,
                color: 'var(--fg)',
              }}
            >
              {entry.word}
            </h3>
            <CEFRBadge level={entry.cefrLevel} size={compact ? 'sm' : 'md'} />
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'var(--surface-alt)',
                color: 'var(--muted-fg)',
                fontWeight: 500,
              }}
            >
              {entry.partOfSpeech}
            </span>
            {entry.isMastered && (
              <span style={{ fontSize: 11, color: 'var(--success-color)', fontWeight: 600 }}>
                ✓ Đã thuộc
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--muted-fg)', fontStyle: 'italic' }}>
              {entry.ipa}
            </span>
            <PronunciationButton word={entry.word} compact={compact} />
          </div>

          <p style={{ fontSize: 14, color: 'var(--fg)', marginTop: 8, lineHeight: 1.5 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>🇻🇳</span>{' '}
            {entry.vietnameseMeaning}
          </p>

          {entry.register && (
            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontWeight: 500,
              }}
            >
              {entry.register}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onToggleMastered && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleMastered(entry.id); }}
              style={{
                padding: 6,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: entry.isMastered ? 'var(--success-color)' : 'var(--muted)',
                transition: 'all 0.2s',
              }}
              title={entry.isMastered ? 'Đánh dấu chưa thuộc' : 'Đánh dấu đã thuộc'}
            >
              {entry.isMastered ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              style={{
                padding: 6,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--muted)',
                transition: 'all 0.2s',
              }}
              title="Xóa từ"
            >
              <Trash2 size={16} />
            </button>
          )}
          {compact && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              style={{
                padding: 6,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--muted)',
              }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {[
              { key: 'contexts' as const, label: 'Ngữ cảnh', icon: BookOpen },
              { key: 'collocations' as const, label: 'Collocations', icon: Layers },
              { key: 'pitfalls' as const, label: 'Lưu ý', icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === tab.key ? 'var(--primary-soft)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted-fg)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: activeTab === tab.key ? 600 : 500,
                  transition: 'all 0.2s',
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'contexts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entry.contexts.map((ctx, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
                    📚 {ctx.domain}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &ldquo;{ctx.exampleSentence}&rdquo;
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>
                    → {ctx.sentenceMeaning}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'collocations' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {entry.collocations.map((col, i) => (
                <span
                  key={i}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border-light)',
                    fontSize: 13,
                    color: 'var(--fg)',
                    fontWeight: 500,
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'pitfalls' && entry.commonPitfalls && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: 'var(--accent-soft)',
                border: '1px solid var(--warning-color)30',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <AlertTriangle size={14} style={{ color: 'var(--warning-color)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning-color)' }}>
                  Lưu ý thường gặp
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>
                {entry.commonPitfalls}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
