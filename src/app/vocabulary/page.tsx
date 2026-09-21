'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid3X3, List, SortAsc } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useVocabulary } from '@/hooks/useVocabulary';
import { WordCard } from '@/components/vocabulary/WordCard';
import { CEFR_LEVELS } from '@/lib/types';

export default function VocabularyPage() {
  const { words, loading, removeWord, toggleMastered } = useVocabulary();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCEFR, setFilterCEFR] = useState('');
  const [filterPOS, setFilterPOS] = useState('');
  const [filterMastered, setFilterMastered] = useState<'' | 'yes' | 'no'>('');
  const [sortBy, setSortBy] = useState<'date' | 'alpha' | 'cefr'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const posOptions = useMemo(() => {
    const set = new Set(words.map((w) => w.partOfSpeech));
    return Array.from(set).sort();
  }, [words]);

  const filteredWords = useMemo(() => {
    let result = [...words];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.vietnameseMeaning.toLowerCase().includes(q)
      );
    }
    if (filterCEFR) {
      result = result.filter((w) => w.cefrLevel === filterCEFR);
    }
    if (filterPOS) {
      result = result.filter((w) => w.partOfSpeech === filterPOS);
    }
    if (filterMastered === 'yes') {
      result = result.filter((w) => w.isMastered);
    } else if (filterMastered === 'no') {
      result = result.filter((w) => !w.isMastered);
    }

    result.sort((a, b) => {
      if (sortBy === 'alpha') return a.word.localeCompare(b.word);
      if (sortBy === 'cefr') return a.cefrLevel.localeCompare(b.cefrLevel);
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [words, searchQuery, filterCEFR, filterPOS, filterMastered, sortBy]);

  const selectStyle: React.CSSProperties = {
    padding: '7px 10px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--surface)',
    color: 'var(--fg)',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div>
      <Header
        title="Sổ từ vựng"
        subtitle={`${filteredWords.length} / ${words.length} từ`}
      />

      {/* Search + Filters */}
      <div
        className="glass-card animate-fade-in"
        style={{ padding: 16, marginBottom: 20 }}
      >
        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'var(--surface-alt)',
            marginBottom: 12,
          }}
        >
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ vựng..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--fg)',
            }}
          />
        </div>

        {/* Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--muted-fg)' }} />

          <select
            value={filterCEFR}
            onChange={(e) => setFilterCEFR(e.target.value)}
            style={selectStyle}
          >
            <option value="">Tất cả CEFR</option>
            {Object.keys(CEFR_LEVELS).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={filterPOS}
            onChange={(e) => setFilterPOS(e.target.value)}
            style={selectStyle}
          >
            <option value="">Tất cả loại từ</option>
            {posOptions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <select
            value={filterMastered}
            onChange={(e) => setFilterMastered(e.target.value as '' | 'yes' | 'no')}
            style={selectStyle}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="yes">Đã thuộc ✓</option>
            <option value="no">Cần ôn ○</option>
          </select>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'alpha' | 'cefr')}
              style={selectStyle}
            >
              <option value="date">Mới nhất</option>
              <option value="alpha">A → Z</option>
              <option value="cefr">CEFR Level</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              style={{
                padding: 7,
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                cursor: 'pointer',
                color: 'var(--muted-fg)',
                display: 'flex',
              }}
              title={viewMode === 'list' ? 'Grid view' : 'List view'}
            >
              {viewMode === 'list' ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Word List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 80, borderRadius: 16 }} />
          ))}
        </div>
      ) : filteredWords.length > 0 ? (
        <div
          style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: 12,
          }}
        >
          {filteredWords.map((word, i) => (
            <div key={word.id} className="stagger-item">
              <WordCard
                entry={word}
                compact
                onDelete={removeWord}
                onToggleMastered={toggleMastered}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{ padding: 40, textAlign: 'center' }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
            {searchQuery || filterCEFR || filterPOS ? 'Không tìm thấy từ phù hợp' : 'Chưa có từ vựng nào'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)' }}>
            {searchQuery || filterCEFR || filterPOS
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Tra từ bằng AI để bắt đầu xây dựng sổ tay!'}
          </p>
        </div>
      )}
    </div>
  );
}
