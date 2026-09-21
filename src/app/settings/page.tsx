'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  Palette,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Save,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/hooks/useTheme';
import { getSettings, saveSettings } from '@/lib/storage';
import { exportAllData, importData, clearAllData } from '@/lib/db';
import type { AppSettings, AIMode, AIProvider } from '@/lib/types';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = saveSettings({ [key]: value });
    setSettingsState(updated);
    toast('Đã lưu cài đặt!', 'success');
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lexicon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Đã xuất ${data.length} từ vựng!`, 'success');
    } catch {
      toast('Lỗi khi xuất dữ liệu.', 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const count = await importData(Array.isArray(data) ? data : [data]);
        toast(`Đã nhập ${count} từ vựng!`, 'success');
      } catch {
        toast('File không hợp lệ.', 'error');
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    if (confirm('Bạn chắc chắn muốn xóa TẤT CẢ dữ liệu? Thao tác này không thể hoàn tác!')) {
      await clearAllData();
      toast('Đã xóa tất cả dữ liệu.', 'success');
    }
  };

  const sectionStyle: React.CSSProperties = {
    padding: 20,
    marginBottom: 16,
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--fg)',
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--fg)',
    marginBottom: 6,
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'var(--surface-alt)',
    color: 'var(--fg)',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'monospace',
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: active ? 'var(--primary-soft)' : 'var(--surface)',
    color: active ? 'var(--primary)' : 'var(--muted-fg)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    transition: 'all 0.2s',
  });

  return (
    <div>
      <Header title="Cài đặt" subtitle="Tùy chỉnh ứng dụng theo nhu cầu của bạn" />

      {/* AI Mode */}
      <div className="glass-card animate-slide-up" style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Shield size={18} style={{ color: 'var(--primary)' }} />
          Chế độ AI
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { mode: 'free-web' as AIMode, label: '🌐 Free Web Chat', desc: 'Mở tab AI, không cần API key' },
            { mode: 'free-api' as AIMode, label: '🔑 Free API', desc: 'Gemini API free tier' },
            { mode: 'paid-api' as AIMode, label: '💎 Paid API', desc: 'Multi-provider' },
          ].map(({ mode, label, desc }) => (
            <button
              key={mode}
              onClick={() => updateSetting('aiMode', mode)}
              style={{
                ...toggleBtnStyle(settings.aiMode === mode),
                flex: '1 1 auto',
                minWidth: 140,
                textAlign: 'left',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card animate-slide-up" style={{ ...sectionStyle, animationDelay: '0.1s' }}>
        <div style={sectionTitleStyle}>
          <Key size={18} style={{ color: 'var(--accent)' }} />
          API Keys
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted-fg)' }}>
            (chỉ cần khi dùng Free API hoặc Paid API)
          </span>
        </div>

        {[
          { key: 'geminiApiKey' as const, label: 'Google Gemini', hint: 'Tạo miễn phí tại aistudio.google.com' },
          { key: 'openaiApiKey' as const, label: 'OpenAI', hint: 'platform.openai.com' },
          { key: 'anthropicApiKey' as const, label: 'Anthropic (Claude)', hint: 'console.anthropic.com' },
        ].map(({ key, label, hint }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type={showKeys[key] ? 'text' : 'password'}
                  value={settings[key]}
                  onChange={(e) => {
                    const updated = saveSettings({ [key]: e.target.value });
                    setSettingsState(updated);
                  }}
                  placeholder={hint}
                  style={inputStyle}
                />
              </div>
              <button
                onClick={() => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))}
                style={{
                  padding: '0 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  color: 'var(--muted-fg)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showKeys[key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}

        <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--primary-soft)', fontSize: 12, color: 'var(--primary)' }}>
          💡 Google Gemini API có free tier hào phóng: 15 req/phút, 1500 req/ngày. Tạo key miễn phí tại{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Google AI Studio
          </a>
        </div>
      </div>

      {/* Preferred Provider */}
      <div className="glass-card animate-slide-up" style={{ ...sectionStyle, animationDelay: '0.15s' }}>
        <div style={sectionTitleStyle}>
          <Globe size={18} style={{ color: 'var(--primary)' }} />
          Provider ưa thích (cho API mode)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['gemini', 'chatgpt', 'claude'] as AIProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => updateSetting('preferredProvider', p)}
              style={toggleBtnStyle(settings.preferredProvider === p)}
            >
              {p === 'gemini' ? '✦ Gemini' : p === 'chatgpt' ? '◆ ChatGPT' : '◈ Claude'}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Preference */}
      <div className="glass-card animate-slide-up" style={{ ...sectionStyle, animationDelay: '0.2s' }}>
        <div style={sectionTitleStyle}>
          <Globe size={18} style={{ color: 'var(--primary)' }} />
          Phát âm
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => updateSetting('accentPreference', 'US')}
            style={toggleBtnStyle(settings.accentPreference === 'US')}
          >
            🇺🇸 US English
          </button>
          <button
            onClick={() => updateSetting('accentPreference', 'UK')}
            style={toggleBtnStyle(settings.accentPreference === 'UK')}
          >
            🇬🇧 UK English
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card animate-slide-up" style={{ ...sectionStyle, animationDelay: '0.25s' }}>
        <div style={sectionTitleStyle}>
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          Giao diện
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTheme('light')} style={toggleBtnStyle(theme === 'light')}>
            ☀️ Sáng
          </button>
          <button onClick={() => setTheme('dark')} style={toggleBtnStyle(theme === 'dark')}>
            🌙 Tối
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card animate-slide-up" style={{ ...sectionStyle, animationDelay: '0.3s' }}>
        <div style={sectionTitleStyle}>
          <Download size={18} style={{ color: 'var(--primary)' }} />
          Quản lý dữ liệu
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--fg)',
              fontWeight: 500,
            }}
          >
            <Download size={14} />
            Xuất dữ liệu (JSON)
          </button>
          <button
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--fg)',
              fontWeight: 500,
            }}
          >
            <Upload size={14} />
            Nhập dữ liệu
          </button>
          <button
            onClick={handleClearAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--danger)40',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--danger)',
              fontWeight: 500,
            }}
          >
            <Trash2 size={14} />
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
