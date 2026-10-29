'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
  Mic,
  PenTool,
  HelpCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useVocabulary } from '@/hooks/useVocabulary';
import { usePronunciation } from '@/hooks/usePronunciation';
import { CEFRBadge } from '@/components/vocabulary/CEFRBadge';
import { PronunciationPractice } from '@/components/review/PronunciationPractice';
import { SentencePractice } from '@/components/review/SentencePractice';
import { MeaningPractice } from '@/components/review/MeaningPractice';
import { getSettings } from '@/lib/storage';
import type { PracticeMode, AppSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { useMascot } from '@/context/MascotContext';

export default function ReviewPage() {
  const { words, markReviewed, loading } = useVocabulary();
  const { speak, speaking } = usePronunciation();
  const { triggerEmotion } = useMascot();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState<'all' | 'unmastered'>('unmastered');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('flashcard');
  const [shuffled, setShuffled] = useState(false);

  // Tránh Hydration Mismatch theo nguyên tắc BUG-004
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Trợ lý phản hồi khi làm bài tốt
  const [assistantPraise, setAssistantPraise] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setSettings(getSettings());
  }, []);

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
    setAssistantPraise(null);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % reviewWords.length);
    }, 150);
  }, [reviewWords.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setAssistantPraise(null);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + reviewWords.length) % reviewWords.length);
    }, 150);
  }, [reviewWords.length]);

  const handleMastered = async () => {
    if (currentWord) {
      triggerEmotion('celebrate', `🎉 Tuyệt vời! Bạn đã thuộc từ "${currentWord.word}" rồi! Tiếp tục phát huy nhé! 🏆🏮`, 5500);
      await markReviewed(currentWord.id, true);
      goNext();
    }
  };

  const handleNeedReview = async () => {
    if (currentWord) {
      triggerEmotion('encourage', `Đừng lo nhé, từ "${currentWord.word}" này chúng ta sẽ ôn lại ở lượt tiếp theo! Cố lên nào! 🌸📜`, 4500);
      await markReviewed(currentWord.id, false);
      goNext();
    }
  };

  const handlePracticeSuccess = () => {
    triggerEmotion('happy', `✨ Xuất sắc! Bạn vừa hoàn thành bài tập cho từ "${currentWord?.word}" rất chuẩn! 🦊💖`, 5000);
    setAssistantPraise(
      `🎉 Xuất sắc! Bạn đã thực hành rất tốt từ "${currentWord?.word}". Hãy đánh dấu "Đã thuộc" để ghi nhận nhé!`
    );
  };

  if (loading) {
    return (
      <div>
        <Header title="Ôn tập" subtitle="Flashcards & Trợ lý thông minh" />
        <div className="shimmer" style={{ height: 350, borderRadius: 20 }} />
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div>
        <Header title="Ôn tập" subtitle="Flashcards & Trợ lý thông minh" />
        <div className="glass-card animate-scale-in" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }} className="animate-float">
            🎉
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--fg)',
              marginBottom: 8,
              fontFamily: 'var(--font-display)',
            }}
          >
            {reviewMode === 'unmastered' ? 'Tuyệt vời! Bạn đã thuộc hết rồi!' : 'Chưa có từ vựng nào'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted-fg)', marginBottom: 16 }}>
            {reviewMode === 'unmastered'
              ? 'Tất cả từ đã được đánh dấu "Đã thuộc". Chuyển sang ôn tập tất cả để luyện nói và đặt câu?'
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
        subtitle={`Từ vựng ${currentIndex + 1} / ${reviewWords.length} • Trợ lý chấm điểm AI`}
      />

      {/* Top Controls: Bộ lọc & Trộn bài */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {(['unmastered', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setReviewMode(mode);
                setCurrentIndex(0);
                setFlipped(false);
                setAssistantPraise(null);
              }}
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
          onClick={() => {
            setShuffled(!shuffled);
            setCurrentIndex(0);
            setFlipped(false);
            setAssistantPraise(null);
          }}
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

      {/* Practice Mode Selector Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          marginBottom: 16,
          background: 'var(--surface-alt)',
          padding: 4,
          borderRadius: 12,
        }}
      >
        <button
          onClick={() => setPracticeMode('flashcard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            background: practiceMode === 'flashcard' ? 'var(--surface)' : 'transparent',
            color: practiceMode === 'flashcard' ? 'var(--primary)' : 'var(--muted-fg)',
            boxShadow: practiceMode === 'flashcard' ? 'var(--card-shadow)' : 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: practiceMode === 'flashcard' ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          <Layers size={14} />
          <span>Lật thẻ</span>
        </button>

        <button
          onClick={() => setPracticeMode('pronounce')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            background: practiceMode === 'pronounce' ? 'var(--surface)' : 'transparent',
            color: practiceMode === 'pronounce' ? 'var(--primary)' : 'var(--muted-fg)',
            boxShadow: practiceMode === 'pronounce' ? 'var(--card-shadow)' : 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: practiceMode === 'pronounce' ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          <Mic size={14} />
          <span>Phát âm</span>
        </button>

        <button
          onClick={() => setPracticeMode('sentence')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            background: practiceMode === 'sentence' ? 'var(--surface)' : 'transparent',
            color: practiceMode === 'sentence' ? 'var(--primary)' : 'var(--muted-fg)',
            boxShadow: practiceMode === 'sentence' ? 'var(--card-shadow)' : 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: practiceMode === 'sentence' ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          <PenTool size={14} />
          <span>Đặt câu</span>
        </button>

        <button
          onClick={() => setPracticeMode('meaning')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 8,
            border: 'none',
            background: practiceMode === 'meaning' ? 'var(--surface)' : 'transparent',
            color: practiceMode === 'meaning' ? 'var(--primary)' : 'var(--muted-fg)',
            boxShadow: practiceMode === 'meaning' ? 'var(--card-shadow)' : 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: practiceMode === 'meaning' ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          <HelpCircle size={14} />
          <span>Nhớ nghĩa</span>
        </button>
      </div>

      {/* Main Practice Container */}
      {currentWord && (
        <div style={{ marginBottom: 20 }}>
          {/* Mode 1: Classic Flashcard */}
          {practiceMode === 'flashcard' && (
            <div
              className={`flashcard ${flipped ? 'flipped' : ''} animate-scale-in`}
              onClick={() => setFlipped(!flipped)}
            >
              <div
                className="flashcard-inner"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                }}
              >
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
                  <p
                    style={{
                      fontSize: 16,
                      color: 'var(--muted-fg)',
                      fontStyle: 'italic',
                      marginBottom: 12,
                    }}
                  >
                    {currentWord.ipa}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentWord.word, mounted ? settings.accentPreference : 'US');
                    }}
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
                <div
                  className="flashcard-back"
                  style={{
                    background: 'var(--surface)',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          color: 'var(--fg)',
                        }}
                      >
                        {currentWord.word}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: 'var(--surface-alt)',
                          color: 'var(--muted-fg)',
                        }}
                      >
                        {currentWord.partOfSpeech}
                      </span>
                      <CEFRBadge level={currentWord.cefrLevel} size="sm" />
                    </div>

                    <p style={{ fontSize: 15, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 14 }}>
                      🇻🇳 {currentWord.vietnameseMeaning}
                    </p>

                    {currentWord.collocations.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--muted-fg)',
                            marginBottom: 5,
                          }}
                        >
                          Collocations:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {currentWord.collocations.map((c, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: 12,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: 'var(--primary-soft)',
                                color: 'var(--primary)',
                                fontWeight: 500,
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentWord.contexts[0] && (
                      <div
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          background: 'var(--surface-alt)',
                          marginBottom: 10,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--primary)',
                            marginBottom: 3,
                          }}
                        >
                          📚 {currentWord.contexts[0].domain}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            fontStyle: 'italic',
                            color: 'var(--fg)',
                            lineHeight: 1.4,
                          }}
                        >
                          &ldquo;{currentWord.contexts[0].exampleSentence}&rdquo;
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 3 }}>
                          → {currentWord.contexts[0].sentenceMeaning}
                        </p>
                      </div>
                    )}

                    {currentWord.commonPitfalls && (
                      <div
                        style={{
                          fontSize: 12,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'var(--accent-soft)',
                          color: 'var(--fg)',
                          lineHeight: 1.4,
                        }}
                      >
                        ⚠️ {currentWord.commonPitfalls}
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        textAlign: 'center',
                        marginTop: 12,
                      }}
                    >
                      Nhấn để lật lại 👆
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Pronunciation Practice with AI Voice Evaluation */}
          {practiceMode === 'pronounce' && (
            <div
              className="glass-card animate-scale-in"
              style={{
                padding: 24,
                borderRadius: 20,
                background: 'var(--surface)',
                border: '1px solid var(--border-color)',
                minHeight: 320,
              }}
            >
              <PronunciationPractice
                word={currentWord}
                accentPreference={mounted ? settings.accentPreference : 'US'}
                onSuccess={handlePracticeSuccess}
              />
            </div>
          )}

          {/* Mode 3: Sentence Making Practice with AI Assistant */}
          {practiceMode === 'sentence' && (
            <div
              className="glass-card animate-scale-in"
              style={{
                padding: 24,
                borderRadius: 20,
                background: 'var(--surface)',
                border: '1px solid var(--border-color)',
                minHeight: 320,
              }}
            >
              <SentencePractice
                word={currentWord}
                apiKey={mounted ? settings.geminiApiKey : ''}
                onSuccess={handlePracticeSuccess}
              />
            </div>
          )}

          {/* Mode 4: Meaning Recall Practice */}
          {practiceMode === 'meaning' && (
            <div
              className="glass-card animate-scale-in"
              style={{
                padding: 24,
                borderRadius: 20,
                background: 'var(--surface)',
                border: '1px solid var(--border-color)',
                minHeight: 320,
              }}
            >
              <MeaningPractice
                word={currentWord}
                apiKey={mounted ? settings.geminiApiKey : ''}
                onSuccess={handlePracticeSuccess}
              />
            </div>
          )}
        </div>
      )}

      {/* Trợ lý AI khích lệ & đề xuất ghi nhận thuộc từ */}
      {assistantPraise && (
        <div
          className="glass-card animate-slide-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'var(--primary-soft)',
            border: '1px solid var(--primary)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
              {assistantPraise}
            </span>
          </div>

          <button
            onClick={handleMastered}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ✓ Đã thuộc từ này
          </button>
        </div>
      )}

      {/* Navigation & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button
          onClick={goPrev}
          title="Từ trước đó"
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
          title="Từ tiếp theo"
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--muted-fg)',
            marginBottom: 4,
          }}
        >
          <span>Tiến độ ôn tập</span>
          <span>
            {currentIndex + 1} / {reviewWords.length}
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--surface-alt)',
            overflow: 'hidden',
          }}
        >
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
