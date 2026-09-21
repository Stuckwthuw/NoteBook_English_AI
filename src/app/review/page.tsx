'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useVocabulary } from '@/hooks/useVocabulary';
import { usePronunciation } from '@/hooks/usePronunciation';
import { CEFRBadge } from '@/components/vocabulary/CEFRBadge';

export default function ReviewPage() {
  const { words, markReviewed, loading } = useVocabulary();
  const { speak, speaking } = usePronunciation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState<'all' | 'unmastered'>('unmastered');
  const [shuffled, setShuffled] = useState(false);

  const reviewWords = useMemo(() => {
    let pool = reviewMode === 'unmastered' ? words.filter((w) => !w.isMastered) : [...words];
    if (shuffled) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }
    return pool;
  }, [words, reviewMode, shuffled]);

  const currentWord = reviewWords[currentIndex];

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviewWords.length);
    }, 200);
  }, [reviewWords.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + reviewWords.length) % reviewWords.length);
    }, 200);
  }, [reviewWords.length]);

  const handleMastered = async () => {
    if (currentWord) {
      await markReviewed(currentWord.id, true);
      goNext();
    }
  };

  const handleNeedReview = async () => {
    if (currentWord) {
      await markReviewed(currentWord.id, false);
      goNext();
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Ôn tập" subtitle="Flashcards" />
        <div className="shimmer" style={{ height: 300, borderRadius: 20 }} />
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div>
        <Header title="Ôn tập" subtitle="Flashcards" />
        <div className="glass-card animate-scale-in" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }} className="animate-float">🎉</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
            {reviewMode === 'unmastered' ? 'Tuyệt vời! Bạn đã thuộc hết rồi!' : 'Chưa có từ vựng nào'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 16 }}>
            {reviewMode === 'unmastered'
              ? 'Tất cả từ đã được đánh dấu "Đã thuộc". Chuyển sang ôn tập tất cả?'
              : 'Tra từ bằng AI để thêm từ vào sổ tay trước!'}
          </p>
          {reviewMode === 'unmastered' && words.length > 0 && (
            <button
              onClick={() => setReviewMode('all')}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ôn tập tất cả
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Ôn tập"
        subtitle={`Flashcard ${currentIndex + 1} / ${reviewWords.length}`}
      />

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {(['unmastered', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setReviewMode(mode); setCurrentIndex(0); setFlipped(false); }}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: reviewMode === mode ? 'var(--primary-soft)' : 'var(--surface)',
                color: reviewMode === mode ? 'var(--primary)' : 'var(--muted-fg)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: reviewMode === mode ? 600 : 500,
              }}
            >
              {mode === 'unmastered' ? '🔄 Cần ôn' : '📚 Tất cả'}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setShuffled(!shuffled); setCurrentIndex(0); setFlipped(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: shuffled ? 'var(--accent-soft)' : 'var(--surface)',
            color: shuffled ? 'var(--accent)' : 'var(--muted-fg)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Shuffle size={13} />
          {shuffled ? 'Ngẫu nhiên ✓' : 'Trộn bài'}
        </button>
      </div>

      {/* Flashcard */}
      {currentWord && (
        <div
          className={`flashcard ${flipped ? 'flipped' : ''} animate-scale-in`}
          onClick={() => setFlipped(!flipped)}
          style={{ marginBottom: 20 }}
        >
          <div className="flashcard-inner" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 20 }}>
            {/* Front */}
            <div className="flashcard-front" style={{ background: 'var(--surface)' }}>
              <div style={{ marginBottom: 8 }}>
                <CEFRBadge level={currentWord.cefrLevel} />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 800,
                  color: 'var(--fg)',
                  marginBottom: 8,
                }}
              >
                {currentWord.word}
              </h2>
              <p style={{ fontSize: 16, color: 'var(--muted-fg)', fontStyle: 'italic', marginBottom: 12 }}>
                {currentWord.ipa}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-alt)',
                  cursor: 'pointer',
                  color: speaking ? 'var(--primary)' : 'var(--muted-fg)',
                  fontSize: 13,
                  transition: 'all 0.2s',
                }}
              >
                <Volume2 size={16} />
                Nghe phát âm
              </button>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
                Nhấn để lật thẻ 👆
              </p>
            </div>

            {/* Back */}
            <div className="flashcard-back" style={{ background: 'var(--surface)', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left' }}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg)' }}>
                    {currentWord.word}
                  </span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--surface-alt)', color: 'var(--muted-fg)' }}>
                    {currentWord.partOfSpeech}
                  </span>
                  <CEFRBadge level={currentWord.cefrLevel} size="sm" />
                </div>

                <p style={{ fontSize: 15, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 14 }}>
                  🇻🇳 {currentWord.vietnameseMeaning}
                </p>

                {currentWord.collocations.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)', marginBottom: 5 }}>Collocations:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {currentWord.collocations.map((c, i) => (
                        <span key={i} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6, background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 500 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentWord.contexts[0] && (
                  <div style={{ padding: 10, borderRadius: 10, background: 'var(--surface-alt)', marginBottom: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', marginBottom: 3 }}>
                      📚 {currentWord.contexts[0].domain}
                    </p>
                    <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--fg)', lineHeight: 1.4 }}>
                      &ldquo;{currentWord.contexts[0].exampleSentence}&rdquo;
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 3 }}>
                      → {currentWord.contexts[0].sentenceMeaning}
                    </p>
                  </div>
                )}

                {currentWord.commonPitfalls && (
                  <div style={{ fontSize: 12, padding: '8px 10px', borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--fg)', lineHeight: 1.4 }}>
                    ⚠️ {currentWord.commonPitfalls}
                  </div>
                )}

                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
                  Nhấn để lật lại 👆
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button
          onClick={goPrev}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            background: 'var(--surface)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-fg)',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNeedReview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--danger)15',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <XCircle size={16} />
          Cần ôn lại
        </button>

        <button
          onClick={handleMastered}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--success-color)15',
            color: 'var(--success-color)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          Đã thuộc
        </button>

        <button
          onClick={goNext}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            background: 'var(--surface)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-fg)',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-fg)', marginBottom: 4 }}>
          <span>Tiến độ ôn tập</span>
          <span>{currentIndex + 1} / {reviewWords.length}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-alt)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentIndex + 1) / reviewWords.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--primary), #06b6d4)',
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
