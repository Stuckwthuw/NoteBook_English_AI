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
import { AnimeHeroBanner } from '@/components/anime/AnimeHeroBanner';

export default function DashboardPage() {
  const { words, stats, loading, toggleMastered, removeWord, updateWord } = useVocabulary();

  const recentWords = words.slice(0, 3);

  return (
    <div>
      <Header title="Tổng quan" subtitle="Chào mừng bạn quay lại! Hôm nay bạn muốn học từ gì?" />

      {/* Anime Fox Girl Hero Banner */}
      <AnimeHeroBanner
        totalWords={stats.total}
        masteredWords={stats.mastered}
        needReviewWords={stats.needReview}
      />

      {/* Quick Actions — Cyber Glass Bento Style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Link href="/lookup" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card hover-lift"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.75) 0%, rgba(20, 32, 48, 0.7) 100%)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
                flexShrink: 0,
              }}
            >
              <Search size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>Tra từ AI</div>
              <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 1 }}>「検索」Phân tích ngữ cảnh</div>
            </div>
          </div>
        </Link>

        <Link href="/vocabulary" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card hover-lift"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.75) 0%, rgba(30, 24, 48, 0.7) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>Sổ từ vựng</div>
              <div style={{ fontSize: 11, color: '#c084fc', marginTop: 1 }}>「単語帳」{stats.total} mục từ</div>
            </div>
          </div>
        </Link>

        <Link href="/review" style={{ textDecoration: 'none' }}>
          <div
            className="glass-card hover-lift"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.75) 0%, rgba(36, 24, 30, 0.7) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
                flexShrink: 0,
              }}
            >
              <Brain size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>Ôn tập</div>
              <div style={{ fontSize: 11, color: 'var(--fox-ruby)', marginTop: 1 }}>「復習」{stats.needReview} từ cần luyện</div>
            </div>
          </div>
        </Link>
      </div>

      {/* 
        ========================================================================
        Cyber-Shrine Bento Glass Stats (Thay thế hoàn toàn 4 khối màu cục súc cũ!)
        ========================================================================
      */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          {
            label: 'Tổng từ vựng',
            kanji: '総語数',
            value: stats.total,
            icon: '📚',
            accent: '#2dd4bf',
            glow: 'rgba(45, 212, 191, 0.15)',
            border: 'rgba(45, 212, 191, 0.3)',
            bg: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(17, 24, 39, 0.85) 100%)',
          },
          {
            label: 'Đã thuộc',
            kanji: '習得済',
            value: stats.mastered,
            icon: '✨',
            accent: '#4ade80',
            glow: 'rgba(74, 222, 128, 0.15)',
            border: 'rgba(74, 222, 128, 0.3)',
            bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(17, 24, 39, 0.85) 100%)',
          },
          {
            label: 'Cần ôn',
            kanji: '復習要',
            value: stats.needReview,
            icon: '🔥',
            accent: '#fbbf24',
            glow: 'rgba(251, 191, 36, 0.15)',
            border: 'rgba(251, 191, 36, 0.3)',
            bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(17, 24, 39, 0.85) 100%)',
          },
          {
            label: 'Hôm nay',
            kanji: '新学習',
            value: stats.todayAdded,
            icon: '🌸',
            accent: '#f43f5e',
            glow: 'rgba(244, 63, 94, 0.15)',
            border: 'rgba(244, 63, 94, 0.3)',
            bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(17, 24, 39, 0.85) 100%)',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="animate-slide-up stagger-item"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '16px 18px',
              borderRadius: 18,
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.25), 0 0 16px ${stat.glow}`,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Chữ Kanji Thần Thủy Mờ góc trên bên phải */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                fontSize: 10,
                fontWeight: 800,
                color: stat.accent,
                opacity: 0.65,
                letterSpacing: '1px',
              }}
            >
              「{stat.kanji}」
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{stat.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--muted-fg)', fontWeight: 600 }}>{stat.label}</span>
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: stat.accent,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: `0 0 16px ${stat.glow}`,
              }}
            >
              {loading ? '—' : stat.value}
            </div>
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
