'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { usePronunciation } from '@/hooks/usePronunciation';
import { evaluatePronunciation } from '@/lib/ai/evaluator';
import type { WordData, PronunciationResult } from '@/lib/types';
import { useMascot } from '@/context/MascotContext';

interface PronunciationPracticeProps {
  word: WordData;
  onSuccess?: () => void;
  accentPreference?: 'US' | 'UK';
}

export function PronunciationPractice({
  word,
  onSuccess,
  accentPreference = 'US',
}: PronunciationPracticeProps) {
  const { isListening, transcript, error, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const { speak, speaking } = usePronunciation();
  const { triggerEmotion } = useMascot();

  const [evalResult, setEvalResult] = useState<PronunciationResult | null>(null);

  // Khi transcript có kết quả và người dùng ngừng nói
  useEffect(() => {
    if (!isListening && transcript) {
      const result = evaluatePronunciation(transcript, word.word, word.ipa);
      setEvalResult(result);
      if (result.score >= 85) {
        triggerEmotion('celebrate', `🎉 Xuất sắc! Bạn phát âm từ "${word.word}" chuẩn xác ${result.score}% luôn nè!`, 5000);
        if (onSuccess) onSuccess();
      } else if (result.score < 60) {
        triggerEmotion('encourage', `Đừng lo nhé! Bấm nghe lại phát âm mẫu rồi thử lại cùng thiếp nha! 🌸`, 4500);
      } else {
        triggerEmotion('happy', `Khá tốt rồi đó (${result.score}%)! Chú ý thêm một chút về trọng âm nha! ✨`, 4500);
      }
    }
  }, [isListening, transcript, word.word, word.ipa, onSuccess, triggerEmotion]);

  // Reset khi đổi từ
  useEffect(() => {
    resetTranscript();
    setEvalResult(null);
  }, [word.word, resetTranscript]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setEvalResult(null);
      resetTranscript();
      triggerEmotion('thinking', 'Thiếp đang lắng nghe bạn đọc... Hãy phát âm thật tự tin nha! 🎙️🦊', 5000);
      const lang = accentPreference === 'UK' ? 'en-GB' : 'en-US';
      startListening(lang);
    }
  };

  const handleRetry = () => {
    setEvalResult(null);
    resetTranscript();
    const lang = accentPreference === 'UK' ? 'en-GB' : 'en-US';
    startListening(lang);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 4px' }}>
      {/* Target Word & IPA */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--fg)',
            marginBottom: 4,
          }}
        >
          {word.word}
        </h3>
        <p style={{ fontSize: 16, color: 'var(--primary)', fontStyle: 'italic', marginBottom: 12 }}>
          {word.ipa}
        </p>

        {/* Nút nghe mẫu */}
        <button
          onClick={() => speak(word.word, accentPreference)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 20,
            border: '1px solid var(--border-color)',
            background: 'var(--surface-alt)',
            cursor: 'pointer',
            color: speaking ? 'var(--primary)' : 'var(--muted-fg)',
            fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          <Volume2 size={16} />
          Nghe phát âm chuẩn ({accentPreference})
        </button>
      </div>

      {/* Mic Action Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
        }}
      >
        {!isSupported ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: 'var(--danger)15',
              color: 'var(--danger)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            Trình duyệt của bạn không hỗ trợ Web Speech API. Hãy mở bằng Google Chrome, Brave hoặc Microsoft Edge để luyện phát âm.
          </div>
        ) : (
          <>
            <button
              onClick={handleToggleMic}
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                border: isListening ? '3px solid var(--danger)' : '3px solid var(--primary)',
                background: isListening ? 'var(--danger)20' : 'var(--primary-soft)',
                color: isListening ? 'var(--danger)' : 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening ? '0 0 24px var(--danger)50' : '0 4px 16px rgba(13, 148, 136, 0.2)',
                transition: 'all 0.25s ease',
              }}
              title={isListening ? 'Bấm để dừng' : 'Bấm để nói'}
            >
              {isListening ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <MicOff size={32} className="animate-pulse" />
                </div>
              ) : (
                <Mic size={32} />
              )}
            </button>

            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted-fg)', fontWeight: 500 }}>
              {isListening ? '🎙️ Đang lắng nghe bạn đọc...' : 'Nhấn vào Micro và đọc từ trên'}
            </p>

            {/* Transcript hiển thị tạm thời lúc đang nói */}
            {isListening && transcript && (
              <div
                style={{
                  marginTop: 10,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'var(--surface-alt)',
                  fontSize: 14,
                  color: 'var(--fg)',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{transcript}&rdquo;
              </div>
            )}
          </>
        )}

        {/* Lỗi nếu có */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--danger)15',
              color: 'var(--danger)',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Trợ lý chấm điểm giọng nói */}
      {evalResult && (
        <div
          className="glass-card animate-scale-in"
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 16,
            border: `1px solid ${
              evalResult.score >= 85
                ? 'var(--success-color)'
                : evalResult.score >= 60
                ? 'var(--warning-color)'
                : 'var(--danger)'
            }`,
            background: 'var(--surface-alt)',
          }}
        >
          {/* Header điểm số */}
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
                Trợ lý chấm điểm giọng nói
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                background:
                  evalResult.score >= 85
                    ? 'var(--success-color)20'
                    : evalResult.score >= 60
                    ? 'var(--warning-color)20'
                    : 'var(--danger)20',
                color:
                  evalResult.score >= 85
                    ? 'var(--success-color)'
                    : evalResult.score >= 60
                    ? 'var(--warning-color)'
                    : 'var(--danger)',
              }}
            >
              {evalResult.score >= 85 ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              {evalResult.score} / 100 điểm
            </div>
          </div>

          {/* Chi tiết máy nghe được */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--surface)',
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--muted-fg)' }}>AI nghe thấy: </span>
            <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
              &ldquo;{evalResult.spokenText || '(chưa rõ)'}&rdquo;
            </span>
          </div>

          {/* Nhận xét trợ lý */}
          <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 8 }}>
            {evalResult.feedback}
          </p>

          {/* Mẹo IPA */}
          {evalResult.tip && (
            <p style={{ fontSize: 12, color: 'var(--muted-fg)', fontStyle: 'italic', marginBottom: 12 }}>
              💡 {evalResult.tip}
            </p>
          )}

          {/* Nút đọc lại */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={handleRetry}
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
              Thử đọc lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

