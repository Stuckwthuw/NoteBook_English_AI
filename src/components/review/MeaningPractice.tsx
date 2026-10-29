'use client';

import React, { useState } from 'react';
import { Check, Sparkles, CheckCircle2, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { evaluateMeaning } from '@/lib/ai/evaluator';
import type { WordData, MeaningEvaluationResult } from '@/lib/types';

interface MeaningPracticeProps {
  word: WordData;
  apiKey?: string;
  onSuccess?: () => void;
}

export function MeaningPractice({ word, apiKey, onSuccess }: MeaningPracticeProps) {
  const [inputMeaning, setInputMeaning] = useState('');
  const [checking, setChecking] = useState(false);
  const [evalResult, setEvalResult] = useState<MeaningEvaluationResult | null>(null);
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMeaning.trim() || checking) return;

    setChecking(true);
    try {
      const result = await evaluateMeaning(inputMeaning, word, apiKey);
      setEvalResult(result);
      if (result.score >= 80 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Lỗi kiểm tra nghĩa:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleReset = () => {
    setInputMeaning('');
    setEvalResult(null);
    setShowFullAnswer(false);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 4px' }}>
      {/* Target Word */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--fg)',
            marginBottom: 4,
          }}
        >
          {word.word}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted-fg)', fontStyle: 'italic' }}>
          {word.ipa} • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{word.partOfSpeech}</span>
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleCheck} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted-fg)', marginBottom: 6 }}>
            Nhập nghĩa tiếng Việt hoặc tiếng Anh của từ:
          </label>
          <input
            type="text"
            value={inputMeaning}
            onChange={(e) => setInputMeaning(e.target.value)}
            placeholder="Ví dụ: trích xuất, chiết xuất, rút ra..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--surface-alt)',
              color: 'var(--fg)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
            }}
            disabled={checking}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowFullAnswer(!showFullAnswer)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: 'none',
              background: 'none',
              color: 'var(--muted-fg)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={14} />
            {showFullAnswer ? 'Ẩn đáp án' : 'Xem đáp án gợi ý'}
          </button>

          <button
            type="submit"
            disabled={!inputMeaning.trim() || checking}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 10,
              border: 'none',
              background: !inputMeaning.trim() || checking ? 'var(--muted)' : 'var(--primary)',
              color: 'white',
              cursor: !inputMeaning.trim() || checking ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {checking ? (
              <>
                <Sparkles size={15} className="animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              <>
                <Check size={15} />
                Kiểm tra nghĩa
              </>
            )}
          </button>
        </div>
      </form>

      {/* Xem đáp án gợi ý nếu người dùng cần */}
      {showFullAnswer && !evalResult && (
        <div
          className="glass-card animate-slide-down"
          style={{
            padding: 12,
            borderRadius: 12,
            background: 'var(--surface-alt)',
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
            Đáp án chuẩn:
          </p>
          <p style={{ color: 'var(--fg)', marginBottom: 6 }}>🇻🇳 {word.vietnameseMeaning}</p>
          {word.synonyms && word.synonyms.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
              Từ đồng nghĩa (Synonyms): {word.synonyms.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Kết quả chấm điểm nhớ nghĩa */}
      {evalResult && (
        <div
          className="glass-card animate-scale-in"
          style={{
            marginTop: 12,
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
                Đánh giá mức độ hiểu từ
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

          <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 10 }}>
            {evalResult.feedback}
          </p>

          <div
            style={{
              padding: 10,
              borderRadius: 10,
              background: 'var(--surface)',
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            <p style={{ color: 'var(--muted-fg)', fontSize: 12, marginBottom: 2 }}>Nghĩa chính thức:</p>
            <p style={{ fontWeight: 600, color: 'var(--fg)' }}>🇻🇳 {word.vietnameseMeaning}</p>
            {word.synonyms && word.synonyms.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6 }}>
                Từ đồng nghĩa tiếng Anh: {word.synonyms.join(', ')}
              </p>
            )}
          </div>

          {/* Nút thử lại */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
              Thử nhập lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

