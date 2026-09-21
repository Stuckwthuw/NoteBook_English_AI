'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Brain,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useVocabulary } from '@/hooks/useVocabulary';
import { CEFRBadge } from '@/components/vocabulary/CEFRBadge';
import { WordCard } from '@/components/vocabulary/WordCard';

export default function DashboardPage() {
  const { words, stats, loading, toggleMastered, removeWord, updateWord } = useVocabulary();

  const recentWords = words.slice(0, 3);

  return (
    <div>
      <Header title="Tổng quan" subtitle="Chào mừng bạn quay lại! Hôm nay bạn muốn học từ gì?" />

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <Link href="/lookup" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card"
            style={{
              padding: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Tra từ AI</div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>Phân tích nhanh</div>
            </div>
          </div>
        </Link>

        <Link href="/vocabulary" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card"
            style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Sổ từ vựng</div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{stats.total} từ</div>
            </div>
          </div>
        </Link>

        <Link href="/review" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card"
            style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Brain size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Ôn tập</div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>Flashcards</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Tổng từ vựng', value: stats.total, gradient: 'stat-gradient-1', icon: '📚' },
          { label: 'Đã thuộc', value: stats.mastered, gradient: 'stat-gradient-2', icon: '✅' },
          { label: 'Cần ôn', value: stats.needReview, gradient: 'stat-gradient-3', icon: '🔄' },
          { label: 'Hôm nay', value: stats.todayAdded, gradient: 'stat-gradient-4', icon: '🆕' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.gradient} animate-slide-up stagger-item`}
            style={{
              padding: 18,
              borderRadius: 16,
              color: 'white',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {loading ? '—' : stat.value}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CEFR Distribution */}
      {stats.total > 0 && (
        <div className="glass-card animate-slide-up" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Phân bố CEFR Level</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(stats.byCEFR).map(([level, count]) => (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                }}
              >
                <CEFRBadge level={level} size="sm" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>{count}</span>
                <span style={{ fontSize: 11, color: 'var(--muted-fg)' }}>từ</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Words */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Từ vựng gần đây</h2>
          </div>
          {words.length > 3 && (
            <Link
              href="/vocabulary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentWords.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentWords.map((word) => (
              <WordCard
                key={word.id}
                entry={word}
                compact
                onDelete={removeWord}
                onToggleMastered={toggleMastered}
                onUpdate={updateWord}
              />
            ))}
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              padding: 40,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }} className="animate-float">📖</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
              Chưa có từ vựng nào
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 16 }}>
              Bắt đầu tra từ bằng AI để xây dựng sổ tay từ vựng của bạn!
            </p>
            <Link
              href="/lookup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              Tra từ đầu tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
