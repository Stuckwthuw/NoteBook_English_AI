'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { AILookupPanel } from '@/components/ai/AILookupPanel';
import { WordCard } from '@/components/vocabulary/WordCard';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useToast } from '@/components/ui/Toast';
import type { WordData, VocabularyEntry } from '@/lib/types';
import { Save, Plus } from 'lucide-react';

function LookupContent() {
  const searchParams = useSearchParams();
  const wordParam = searchParams.get('word') || searchParams.get('q') || '';
  const autoPaste = searchParams.get('paste') === '1';
  const [lastResult, setLastResult] = useState<WordData | null>(null);
  const [saved, setSaved] = useState(false);
  const { addWord } = useVocabulary();
  const { toast } = useToast();

  const handleResult = (data: WordData) => {
    setLastResult(data);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!lastResult) return;
    try {
      await addWord(lastResult);
      setSaved(true);
      toast(`"${lastResult.word}" đã lưu vào sổ tay!`, 'success');
    } catch {
      toast('Lỗi khi lưu từ.', 'error');
    }
  };

  return (
    <div>
      <Header
        title="Tra từ AI"
        subtitle="Phân tích từ vựng chuyên sâu bằng trí tuệ nhân tạo"
      />

      <AILookupPanel initialWord={wordParam} autoOpenPaste={autoPaste} onResult={handleResult} />

      {/* Result Preview */}
      {lastResult && (
        <div className="animate-slide-up" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>
              ✨ Kết quả phân tích
            </h2>
            {!saved ? (
              <button
                onClick={handleSave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <Save size={14} />
                Lưu vào sổ tay
              </button>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--success-color)', fontWeight: 600 }}>
                ✓ Đã lưu
              </span>
            )}
          </div>

          <WordCard
            entry={{
              ...lastResult,
              id: 'preview-result',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              isMastered: false,
              reviewCount: 0,
              lastReviewedAt: null,
            } as VocabularyEntry}
          />

          {saved && (
            <button
              onClick={() => { setLastResult(null); setSaved(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '12px auto 0',
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                color: 'var(--fg)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Plus size={14} />
              Tra từ khác
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="shimmer" style={{ height: 200, borderRadius: 16 }} />}>
      <LookupContent />
    </Suspense>
  );
}
