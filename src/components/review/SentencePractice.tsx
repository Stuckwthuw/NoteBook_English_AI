'use client';

import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle2, AlertCircle, Volume2, Lightbulb, RefreshCw } from 'lucide-react';
import { evaluateSentence } from '@/lib/ai/evaluator';
import { usePronunciation } from '@/hooks/usePronunciation';
import type { WordData, SentenceEvaluationResult } from '@/lib/types';

interface SentencePracticeProps {
  word: WordData;
  apiKey?: string;
  onSuccess?: () => void;
}

export function SentencePractice({ word, apiKey, onSuccess }: SentencePracticeProps) {
  const [sentence, setSentence] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<SentenceEvaluationResult | null>(null);
  const { speak } = usePronunciation();

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim() || evaluating) return;

    setEvaluating(true);
    try {
      const result = await evaluateSentence(sentence, word, apiKey);
      setEvalResult(result);
      if (result.score >= 80 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Lỗi khi chấm câu:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setSentence('');
    setEvalResult(null);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 4px' }}>
      {/* Target Word & Hints */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg)' }}>
              {word.word}
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
              {word.partOfSpeech}
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
            🇻🇳 {word.vietnameseMeaning}
          </span>
        </div>

        {/* Gợi ý collocations */}
        {word.collocations && word.collocations.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Lightbulb size={12} color="var(--accent)" /> Gợi ý cụm từ:
            </span>
            {word.collocations.slice(0, 3).map((col, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSentence((prev) => (prev ? `${prev} ${col}` : `I want to ${col}`))}
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                title="Bấm để chèn vào câu"
              >
                + {col}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleEvaluate}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder={`Viết câu tiếng Anh chứa từ "${word.word}" (VD: You can use "${word.word}" in a sentence...)`}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--surface-alt)',
              color: 'var(--fg)',
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              transition: 'border-color 0.2s',
            }}
            disabled={evaluating}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
            {sentence.trim().split(/\s+/).filter(Boolean).length} từ
          </span>

          <button
            type="submit"
            disabled={!sentence.trim() || evaluating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: !sentence.trim() || evaluating ? 'var(--muted)' : 'var(--primary)',
              color: 'white',
              cursor: !sentence.trim() || evaluating ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {evaluating ? (
              <>
                <Sparkles size={15} className="animate-spin" />
                Trợ lý đang chấm điểm...
              </>
            ) : (
              <>
                <Send size={15} />
                Chấm điểm câu
              </>
            )}
          </button>
        </div>
      </form>

      {/* Kết quả chấm điểm câu */}
      {evalResult && (
        <div
          className="glass-card animate-scale-in"
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 16,
            border: `1px solid ${
              evalResult.score >= 80
                ? 'var(--success-color)'
                : evalResult.score >= 60
                ? 'var(--warning-color)'
                : 'var(--danger)'
            }`,
            background: 'var(--surface-alt)',
          }}
        >
          {/* Header kết quả */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
                Đánh giá của Trợ lý AI
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                background:
                  evalResult.score >= 80
                    ? 'var(--success-color)20'
                    : evalResult.score >= 60
                    ? 'var(--warning-color)20'
                    : 'var(--danger)20',
                color:
                  evalResult.score >= 80
                    ? 'var(--success-color)'
                    : evalResult.score >= 60
                    ? 'var(--warning-color)'
                    : 'var(--danger)',
              }}
            >
              {evalResult.score >= 80 ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {evalResult.score} / 100 điểm
            </div>
          </div>

          {/* Nhận xét ngữ pháp */}
          <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 12 }}>
            {evalResult.feedback}
          </p>

          {/* Gợi ý câu tự nhiên hơn nếu có */}
          {evalResult.betterSentence && (
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background: 'var(--surface)',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>
                  💡 Gợi ý câu diễn đạt tự nhiên hơn:
                </span>
                <button
                  type="button"
                  onClick={() => speak(evalResult.betterSentence!)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                  }}
                  title="Nghe câu này"
                >
                  <Volume2 size={13} /> Nghe
                </button>
              </div>
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--fg)', lineHeight: 1.4 }}>
                &ldquo;{evalResult.betterSentence}&rdquo;
              </p>
              {evalResult.translation && (
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>
                  → {evalResult.translation}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                color: 'var(--primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} />
              Đặt câu khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

