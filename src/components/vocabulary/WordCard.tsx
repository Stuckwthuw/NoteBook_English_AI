'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Trash2,
  CheckCircle2,
  Circle,
  BookOpen,
  AlertTriangle,
  Layers,
  GitBranch,
  ArrowLeftRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import type { VocabularyEntry } from '@/lib/types';
import { CEFRBadge } from './CEFRBadge';
import { PronunciationButton } from './PronunciationButton';
import { triggerWordMasteredBurst } from '@/lib/confetti';

interface WordCardProps {
  entry: VocabularyEntry;
  onDelete?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
  onUpdate?: (updated: VocabularyEntry) => void;
  compact?: boolean;
}

type TabType = 'contexts' | 'family' | 'synonyms' | 'collocations' | 'pitfalls';

export function WordCard({ entry, onDelete, onToggleMastered, onUpdate, compact = false }: WordCardProps) {
  // MẶC ĐỊNH LUÔN THU GỌN để giao diện cực kỳ thoáng đãng, tinh tế, không rối mắt!
  // Chỉ khi người dùng click vào thẻ mới bung nở toàn bộ thông tin chi tiết.
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('contexts');
  const [isEditingPOS, setIsEditingPOS] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMastered) {
      if (!entry.isMastered) {
        // Kích hoạt pháo hoa hạt năng lượng bùng nổ ngay tại vị trí click!
        triggerWordMasteredBurst(e);
      }
      onToggleMastered(entry.id);
    }
  };

  return (
    <div
      className={`cyber-word-card ${expanded ? 'expanded' : ''} ${entry.isMastered ? 'mastered' : ''}`}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: entry.isMastered
          ? '1.5px solid rgba(74, 222, 128, 0.4)'
          : expanded
          ? '1.5px solid rgba(45, 212, 191, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        background: entry.isMastered
          ? 'linear-gradient(135deg, rgba(16, 26, 24, 0.88) 0%, rgba(13, 20, 30, 0.92) 100%)'
          : expanded
          ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(20, 30, 48, 0.94) 100%)'
          : 'linear-gradient(135deg, rgba(17, 24, 39, 0.75) 0%, rgba(22, 30, 46, 0.72) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: entry.isMastered
          ? '0 6px 20px rgba(74, 222, 128, 0.12), inset 0 1px 0 rgba(255,255,255,0.08)'
          : expanded
          ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(45, 212, 191, 0.15)'
          : '0 4px 14px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Viền sáng vi điểm phía trên khi thẻ mở rộng */}
      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--primary), var(--fox-ruby), transparent)',
            boxShadow: '0 0 10px var(--primary)',
          }}
        />
      )}

      {/* 
        ========================================================================
        1. SLEEK COMPACT ROW (Chỉ hiện: Checkbox + Từ vựng + Phiên âm + Loa + Badge)
        - Chiều cao cực kỳ gọn gàng (~54px)
        - Thoáng mắt, tinh tế, chuẩn giao diện từ điển hiện đại
        ========================================================================
      */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Left Group: Check + Word + IPA + Audio + Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {/* Nút check trạng thái Đã thuộc */}
          {onToggleMastered && (
            <button
              onClick={handleToggle}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                color: entry.isMastered ? 'var(--success-color)' : 'var(--muted)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title={entry.isMastered ? 'Bấm để đánh dấu cần ôn lại' : 'Bấm để đánh dấu đã thuộc (Bùng nổ pháo hoa ✨)'}
            >
              {entry.isMastered ? (
                <CheckCircle2
                  size={21}
                  style={{
                    color: '#4ade80',
                    filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.6))',
                  }}
                />
              ) : (
                <Circle size={21} className="hover:text-teal-400" />
              )}
            </button>
          )}

          {/* Word & IPA */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 700,
                color: entry.isMastered ? '#4ade80' : '#f8fafc',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                textShadow: entry.isMastered
                  ? '0 0 12px rgba(74, 222, 128, 0.4)'
                  : expanded
                  ? '0 0 10px rgba(45, 212, 191, 0.4)'
                  : 'none',
              }}
            >
              {entry.word}
            </span>

            {/* Phiên âm IPA nghiêng xám khói */}
            <span
              style={{
                fontSize: 13,
                color: 'var(--muted-fg)',
                fontStyle: 'italic',
                fontFamily: 'inherit',
              }}
            >
              {entry.ipa}
            </span>
          </div>

          {/* Nút phát âm âm thanh (bấm không làm nở/thu thẻ) */}
          <div onClick={(e) => e.stopPropagation()}>
            <PronunciationButton word={entry.word} compact={true} />
          </div>

          {/* Badges: CEFR & Part of Speech */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CEFRBadge level={entry.cefrLevel} size="sm" />

            {isEditingPOS ? (
              <select
                value={entry.partOfSpeech}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  setIsEditingPOS(false);
                  if (onUpdate) onUpdate({ ...entry, partOfSpeech: e.target.value });
                }}
                onBlur={() => setIsEditingPOS(false)}
                autoFocus
                style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: 'var(--surface)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adjective">adjective</option>
                <option value="adverb">adverb</option>
                <option value="idiom">idiom</option>
                <option value="phrase">phrase</option>
              </select>
            ) : (
              <span
                onClick={(e) => {
                  if (onUpdate) {
                    e.stopPropagation();
                    setIsEditingPOS(true);
                  }
                }}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--muted-fg)',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textTransform: 'lowercase',
                }}
                title={onUpdate ? 'Nhấn để sửa loại từ' : undefined}
              >
                {entry.partOfSpeech}
              </span>
            )}
          </div>
        </div>

        {/* Right Group: Action buttons & Expansion Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Bạn có chắc muốn xóa từ "${entry.word}" khỏi sổ tay không?`)) {
                  onDelete(entry.id);
                }
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              className="hover:text-red-400 hover:bg-red-500/10"
              title="Xóa từ này"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Mũi tên chỉ báo mở rộng mượt mà */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: expanded ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: expanded ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: expanded ? 'var(--primary)' : 'var(--muted-fg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <ChevronDown size={15} />
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        2. EXPANDED FULL DETAILS (BÙNG NỔ KHI CLICK)
        - Nghĩa tiếng Việt đầy đủ, định dạng số thứ tự rõ nét
        - Bộ Tab: Ngữ cảnh, Họ từ, Đồng/Trái nghĩa, Collocations, Lưu ý
        ========================================================================
      */}
      {expanded && (
        <div
          className="animate-slide-down"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0 18px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            marginTop: 4,
          }}
        >
          {/* Nghĩa tiếng Việt */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginTop: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                「意味」Ý NGHĨA CHI TIẾT
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: 'var(--fg)',
                lineHeight: 1.6,
                fontWeight: 500,
                whiteSpace: 'pre-line',
              }}
            >
              {entry.vietnameseMeaning}
            </p>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              paddingBottom: 4,
              marginBottom: 14,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {[
              { id: 'contexts' as TabType, label: 'Ngữ cảnh & Ví dụ', icon: BookOpen, count: entry.contexts?.length || 0 },
              { id: 'family' as TabType, label: 'Họ từ', icon: GitBranch, count: entry.wordFamily?.length || 0 },
              {
                id: 'synonyms' as TabType,
                label: 'Đồng / Trái nghĩa',
                icon: ArrowLeftRight,
                count: (entry.synonyms?.length || 0) + (entry.antonyms?.length || 0),
              },
              { id: 'collocations' as TabType, label: 'Collocations', icon: Link2, count: entry.collocations?.length || 0 },
              { id: 'pitfalls' as TabType, label: 'Lưu ý', icon: AlertTriangle, count: entry.commonPitfalls ? 1 : 0 },
            ].map((tab) => {
              if (tab.count === 0 && tab.id !== 'contexts') return null;
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: isActive ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--muted-fg)',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 6,
                        background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#0f172a' : 'var(--muted-fg)',
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Contexts & Examples */}
          {activeTab === 'contexts' && entry.contexts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entry.contexts.map((ctx, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 6,
                        background: 'rgba(45, 212, 191, 0.15)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                      }}
                    >
                      {ctx.domain}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontStyle: 'italic', marginBottom: 3 }}>
                    &ldquo;{ctx.exampleSentence}&rdquo;
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                    → {ctx.sentenceMeaning}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Word Family */}
          {activeTab === 'family' && entry.wordFamily && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {entry.wordFamily.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{item.word}</span>
                    <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>{item.partOfSpeech}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{item.meaning}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Synonyms & Antonyms */}
          {activeTab === 'synonyms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entry.synonyms && entry.synonyms.length > 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', display: 'block', marginBottom: 6 }}>
                    🟢 Từ đồng nghĩa (Synonyms):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {entry.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: 'rgba(74, 222, 128, 0.1)',
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                        }}
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.antonyms && entry.antonyms.length > 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', display: 'block', marginBottom: 6 }}>
                    🔴 Từ trái nghĩa (Antonyms):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {entry.antonyms.map((ant, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                        }}
                      >
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Collocations */}
          {activeTab === 'collocations' && entry.collocations && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {entry.collocations.map((col, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  🔗 {col}
                </span>
              ))}
            </div>
          )}

          {/* Tab 5: Pitfalls */}
          {activeTab === 'pitfalls' && entry.commonPitfalls && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fef3c7',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              ⚠️ {entry.commonPitfalls}
            </div>
          )}

          {/* Quick Collapse Button */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              onClick={() => setExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 11,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 12px',
                borderRadius: 8,
              }}
              className="hover:text-teal-400 hover:bg-teal-500/10"
            >
              ▲ Thu gọn chi tiết
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
