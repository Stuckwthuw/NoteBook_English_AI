'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardPaste,
  Eye,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Clipboard,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react';
import type { WordData, VocabularyEntry } from '@/lib/types';
import { parseAIResponse, detectResponseType } from '@/lib/ai/parser';
import { WordCard } from '@/components/vocabulary/WordCard';

interface PasteResultModalProps {
  onResult: (data: WordData) => void;
  onClose: () => void;
  defaultWord?: string;
}

export function PasteResultModal({ onResult, onClose, defaultWord = '' }: PasteResultModalProps) {
  const [text, setText] = useState('');
  const [detectedType, setDetectedType] = useState<'json' | 'natural' | null>(null);
  const [preview, setPreview] = useState<WordData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect when text changes
  useEffect(() => {
    if (text.trim()) {
      const type = detectResponseType(text);
      setDetectedType(type);
    } else {
      setDetectedType(null);
    }
  }, [text]);

  // Handle parsing text
  const handleParse = () => {
    if (!text.trim()) {
      setError('Vui lòng nhập hoặc dán nội dung từ AI.');
      return;
    }

    try {
      const data = parseAIResponse(text, defaultWord);
      setPreview(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message || 'Không thể đọc nội dung. Vui lòng kiểm tra lại văn bản.');
      setPreview(null);
    }
  };

  // Handle quick paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText.trim()) {
          setText(clipText);
          try {
            const data = parseAIResponse(clipText, defaultWord);
            setPreview(data);
            setError(null);
          } catch {
            // let user click Xem trước
          }
        }
      }
    } catch {
      setError('Trình duyệt chưa cho phép truy cập clipboard tự động. Bạn hãy bấm Ctrl + V vào ô văn bản.');
    }
  };

  // Handle update preview field
  const handleFieldChange = (field: keyof WordData, value: unknown) => {
    if (!preview) return;
    setPreview({
      ...preview,
      [field]: value,
    });
  };

  // Handle update context
  const handleContextChange = (index: number, field: 'exampleSentence' | 'sentenceMeaning', val: string) => {
    if (!preview) return;
    const updated = [...preview.contexts];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setPreview({ ...preview, contexts: updated });
  };

  // Add empty context
  const handleAddContext = () => {
    if (!preview) return;
    setPreview({
      ...preview,
      contexts: [
        ...preview.contexts,
        { domain: 'General', exampleSentence: '', sentenceMeaning: '' },
      ],
    });
  };

  // Remove context
  const handleRemoveContext = (index: number) => {
    if (!preview) return;
    const updated = preview.contexts.filter((_, i) => i !== index);
    setPreview({ ...preview, contexts: updated });
  };

  const handleSave = () => {
    if (preview) {
      if (!preview.word.trim()) {
        setError('Từ vựng không được để trống!');
        return;
      }
      onResult(preview);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <ClipboardPaste size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>
                Dán kết quả từ AI
              </h3>
              {defaultWord && (
                <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                  Đang xử lý từ: <strong style={{ color: 'var(--primary)' }}>{defaultWord}</strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 8,
              border: 'none',
              background: 'var(--surface-alt)',
              cursor: 'pointer',
              color: 'var(--muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* Format Hint Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border-light)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--fg)', margin: 0, lineHeight: 1.4 }}>
                Hỗ trợ cả <strong>JSON chuẩn</strong> hoặc <strong>văn bản chat tự do</strong> từ Gemini, ChatGPT, Claude.
              </p>
            </div>

            <button
              onClick={handlePasteFromClipboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--fg)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
              title="Dán nhanh nội dung đang có trong clipboard"
            >
              <Clipboard size={12} />
              Dán Clipboard
            </button>
          </div>

          {/* Text Area */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={`Dán kết quả từ AI vào đây... Ví dụ:

1) Văn bản thường từ Gemini:
Indomitable là tính từ tiếng Anh mang nghĩa là bất khuất, kiên cường...
- Từ đồng nghĩa: invincible, resolute...
Ví dụ sử dụng:
- An indomitable spirit (Một tinh thần bất khuất).

HOẶC 2) JSON chuẩn nếu bạn đã dùng câu lệnh mẫu.`}
              style={{
                width: '100%',
                minHeight: 120,
                padding: 12,
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                background: 'var(--surface-alt)',
                color: 'var(--fg)',
                fontSize: 12,
                fontFamily: 'monospace',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
              }}
            />

            {/* Type indicator badge */}
            {detectedType && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: detectedType === 'json' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                  color: detectedType === 'json' ? '#22c55e' : '#a855f7',
                  border: `1px solid ${detectedType === 'json' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {detectedType === 'json' ? (
                  <>
                    <CheckCircle2 size={12} /> Định dạng JSON
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> Văn bản AI tự nhiên
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'var(--danger)', lineHeight: 1.4, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface)',
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--fg)',
                  opacity: text.trim() ? 1 : 0.5,
                }}
              >
                <Eye size={14} />
                {preview ? 'Phân tích lại' : 'Nhận diện & Xem trước'}
              </button>

              {preview && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: isEditing ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                    color: isEditing ? 'var(--primary)' : 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <Edit3 size={14} />
                  {isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa thông tin'}
                </button>
              )}
            </div>

            {preview && (
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'white',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                }}
              >
                ✨ Lưu vào sổ tay
              </button>
            )}
          </div>

          {/* Quick Edit Form (when isEditing is open) */}
          {preview && isEditing && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 12 }}>
                ✏️ Chỉnh sửa chi tiết từ vựng:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                    Từ vựng (Word) *
                  </label>
                  <input
                    type="text"
                    value={preview.word}
                    onChange={(e) => handleFieldChange('word', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--fg)',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                    Phiên âm (IPA)
                  </label>
                  <input
                    type="text"
                    value={preview.ipa}
                    onChange={(e) => handleFieldChange('ipa', e.target.value)}
                    placeholder="/.../"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--fg)',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                    Loại từ (Part of Speech)
                  </label>
                  <select
                    value={preview.partOfSpeech}
                    onChange={(e) => handleFieldChange('partOfSpeech', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--fg)',
                      fontSize: 13,
                    }}
                  >
                    <option value="adjective">Tính từ (Adjective)</option>
                    <option value="noun">Danh từ (Noun)</option>
                    <option value="verb">Động từ (Verb)</option>
                    <option value="adverb">Trạng từ (Adverb)</option>
                    <option value="phrase">Cụm từ (Phrase)</option>
                    <option value="idiom">Thành ngữ (Idiom)</option>
                    <option value="preposition">Giới từ (Preposition)</option>
                    <option value="conjunction">Liên từ (Conjunction)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                    Cấp độ CEFR
                  </label>
                  <select
                    value={preview.cefrLevel}
                    onChange={(e) => handleFieldChange('cefrLevel', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface)',
                      color: 'var(--fg)',
                      fontSize: 13,
                    }}
                  >
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper-Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficient</option>
                  </select>
                </div>
              </div>

              {/* Meaning */}
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                  Nghĩa tiếng Việt *
                </label>
                <textarea
                  value={preview.vietnameseMeaning}
                  onChange={(e) => handleFieldChange('vietnameseMeaning', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface)',
                    color: 'var(--fg)',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Collocations */}
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                  Từ đồng nghĩa / Collocations (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={preview.collocations.join(', ')}
                  onChange={(e) =>
                    handleFieldChange(
                      'collocations',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface)',
                    color: 'var(--fg)',
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Contexts / Examples */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, color: 'var(--muted-fg)', margin: 0 }}>
                    Câu ví dụ & Dịch nghĩa
                  </label>
                  <button
                    onClick={handleAddContext}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px dashed var(--border-color)',
                      background: 'transparent',
                      color: 'var(--primary)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={12} /> Thêm ví dụ
                  </button>
                </div>

                {preview.contexts.map((ctx, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: 8,
                      borderRadius: 8,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={ctx.exampleSentence}
                        onChange={(e) => handleContextChange(idx, 'exampleSentence', e.target.value)}
                        placeholder="Câu tiếng Anh..."
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--border-light)',
                          background: 'transparent',
                          color: 'var(--fg)',
                          fontSize: 12,
                        }}
                      />
                      <button
                        onClick={() => handleRemoveContext(idx)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                        }}
                        title="Xóa ví dụ này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ctx.sentenceMeaning}
                      onChange={(e) => handleContextChange(idx, 'sentenceMeaning', e.target.value)}
                      placeholder="Dịch nghĩa tiếng Việt..."
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border-light)',
                        background: 'transparent',
                        color: 'var(--muted-fg)',
                        fontSize: 12,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Pitfalls */}
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'block', marginBottom: 4 }}>
                  Lưu ý sử dụng & Tránh nhầm lẫn
                </label>
                <input
                  type="text"
                  value={preview.commonPitfalls}
                  onChange={(e) => handleFieldChange('commonPitfalls', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface)',
                    color: 'var(--fg)',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          )}

          {/* Preview Card */}
          {preview && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', margin: 0 }}>
                  📋 Thẻ từ vựng xem trước:
                </p>
                <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Sẵn sàng lưu
                </span>
              </div>
              <WordCard
                entry={{
                  ...preview,
                  id: 'preview',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  isMastered: false,
                  reviewCount: 0,
                  lastReviewedAt: null,
                } as VocabularyEntry}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
