'use client';

import React, { useState } from 'react';
import { Search, Sparkles, ExternalLink, Clipboard, Loader2 } from 'lucide-react';
import type { WordData, AIProvider, AppSettings } from '@/lib/types';
import { AI_PROVIDERS, DEFAULT_SETTINGS } from '@/lib/types';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/components/ui/Toast';
import { getSettings } from '@/lib/storage';
import { PasteResultModal } from './PasteResultModal';

interface AILookupPanelProps {
  onResult: (data: WordData) => void;
  initialWord?: string;
  autoOpenPaste?: boolean;
}

export function AILookupPanel({ onResult, initialWord = '', autoOpenPaste = false }: AILookupPanelProps) {
  const [word, setWord] = useState(initialWord);
  const [showPasteModal, setShowPasteModal] = useState(autoOpenPaste);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { loading, error, result, openFreeChat, analyzeViaAPI, clearResult } = useAI();
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
    setSettings(getSettings());
  }, []);

  const hasApiKey = mounted && !!(settings.geminiApiKey || settings.openaiApiKey || settings.anthropicApiKey);
  const isAPIMode = mounted && (settings.aiMode === 'free-api' || settings.aiMode === 'paid-api');

  React.useEffect(() => {
    if (initialWord && initialWord.trim()) {
      const clean = initialWord.trim();
      setWord(clean);
      const currentSettings = getSettings();
      const canAPI = (currentSettings.aiMode === 'free-api' || currentSettings.aiMode === 'paid-api') &&
        !!(currentSettings.geminiApiKey || currentSettings.openaiApiKey || currentSettings.anthropicApiKey);
      if (canAPI) {
        analyzeViaAPI(clean).then((data) => {
          if (data) {
            onResult(data);
            toast(`Phân tích "${clean}" thành công!`, 'success');
          }
        }).catch(() => {});
      }
    }
  }, [initialWord]);

  React.useEffect(() => {
    if (autoOpenPaste) {
      setShowPasteModal(true);
    }
  }, [autoOpenPaste]);

  const handleFreeChat = async (provider: AIProvider) => {
    if (!word.trim()) {
      toast('Hãy nhập từ cần tra trước!', 'error');
      return;
    }
    await openFreeChat(word.trim(), provider);
    toast(`Prompt đã copy! Hãy paste vào ${AI_PROVIDERS[provider].name} và copy kết quả về.`, 'success');
    setShowPasteModal(true);
  };

  const handleAPILookup = async () => {
    if (!word.trim()) {
      toast('Hãy nhập từ cần tra trước!', 'error');
      return;
    }
    try {
      const data = await analyzeViaAPI(word.trim());
      if (data) {
        onResult(data);
        toast('Phân tích thành công!', 'success');
      }
    } catch {
      toast('Lỗi khi phân tích. Kiểm tra API key trong Cài đặt.', 'error');
    }
  };

  const handlePasteResult = (data: WordData) => {
    onResult(data);
    setShowPasteModal(false);
    toast('Đã nhận kết quả từ AI!', 'success');
  };

  return (
    <div className="animate-fade-in">
      {/* Search Input */}
      <div
        className="gradient-border"
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 4px 4px 16px' }}>
          <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={word}
            onChange={(e) => { setWord(e.target.value); clearResult(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isAPIMode && hasApiKey) handleAPILookup();
            }}
            placeholder="Nhập từ hoặc cụm từ tiếng Anh... (VD: mitigate, break down, take for granted)"
            style={{
              flex: 1,
              padding: '14px 12px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              color: 'var(--fg)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {isAPIMode && hasApiKey && (
            <button
              onClick={handleAPILookup}
              disabled={loading || !word.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: loading ? 'var(--muted)' : 'linear-gradient(135deg, var(--primary), #06b6d4)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Sparkles size={16} />
              )}
              {loading ? 'Đang phân tích...' : 'Phân tích AI'}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--danger)10',
            border: '1px solid var(--danger)30',
            fontSize: 13,
            color: 'var(--danger)',
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Loading Shimmer */}
      {loading && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="shimmer" style={{ height: 20, borderRadius: 8, width: '60%' }} />
          <div className="shimmer" style={{ height: 16, borderRadius: 8, width: '80%' }} />
          <div className="shimmer" style={{ height: 16, borderRadius: 8, width: '45%' }} />
          <div className="shimmer" style={{ height: 80, borderRadius: 10, width: '100%', marginTop: 4 }} />
        </div>
      )}

      {/* Free Web Chat Mode — AI Provider Buttons */}
      {!isAPIMode || !hasApiKey ? (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
              Chọn AI để tra từ
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
              (miễn phí, không cần API key)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => {
              const config = AI_PROVIDERS[provider];
              return (
                <button
                  key={provider}
                  onClick={() => handleFreeChat(provider)}
                  className={`ai-btn ai-btn-${provider}`}
                  disabled={!word.trim()}
                  style={{ opacity: !word.trim() ? 0.5 : 1 }}
                >
                  <span style={{ fontSize: 28 }}>{config.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
                    {config.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted-fg)', textAlign: 'center' }}>
                    {config.description}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: config.color,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    <ExternalLink size={11} />
                    Mở & Copy prompt
                  </span>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>
              📋 Hướng dẫn tra cứu với AI Chat:
            </p>
            <ol style={{ fontSize: 12, color: 'var(--muted-fg)', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.5 }}>
              <li>Nhập từ cần tra → Nhấn chọn AI bên trên (Gemini, ChatGPT, Claude)</li>
              <li>Hệ thống tự copy câu lệnh mẫu & mở tab AI cho bạn</li>
              <li>
                Tại tab AI: Bấm <strong style={{ color: 'var(--fg)' }}>Ctrl + V</strong> dán câu lệnh mẫu, <em>HOẶC</em> hỏi tự do (VD: <em>&quot;indomitable nghĩa là gì&quot;</em>)
              </li>
              <li>
                Copy toàn bộ hoặc đoạn trả lời của AI → Quay lại đây bấm nút bên dưới để dán (Hệ thống tự động nhận diện từ, phiên âm, loại từ & ví dụ mà không lo lỗi JSON!)
              </li>
            </ol>
          </div>

          {/* Paste Result Button */}
          <button
            onClick={() => setShowPasteModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              marginTop: 12,
              padding: '12px 20px',
              borderRadius: 12,
              border: '2px dashed var(--primary)',
              background: 'rgba(99, 102, 241, 0.05)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--primary)',
              transition: 'all 0.2s',
            }}
          >
            <Clipboard size={16} />
            Dán kết quả từ AI (Hỗ trợ cả JSON & Văn bản chat)
          </button>
        </div>
      ) : null}

      {/* Paste Result Modal */}
      {showPasteModal && (
        <PasteResultModal
          defaultWord={word.trim()}
          onResult={handlePasteResult}
          onClose={() => setShowPasteModal(false)}
        />
      )}
    </div>
  );
}
