'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Brain,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/vocabulary', label: 'Sổ từ vựng', icon: BookOpen },
  { href: '/lookup', label: 'Tra từ AI', icon: Search },
  { href: '/review', label: 'Ôn tập', icon: Brain },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg)' }}>
                Lexicon
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: -2 }}>Smart Notebook</div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mini Mascot Companion Widget */}
        <div
          style={{
            margin: '12px 12px 16px',
            padding: '12px 14px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(45, 212, 191, 0.05) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.06)',
          }}
        >
          <div
            className="anime-breathe"
            style={{
              position: 'relative',
              width: 38,
              height: 44,
              flexShrink: 0,
              filter: 'drop-shadow(0 4px 8px rgba(244, 63, 94, 0.35))',
            }}
          >
            <Image
              src="/anime/mascot-transparent.png"
              alt="Bạch Hồ Ly Mini"
              fill
              sizes="38px"
              style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>Bạch Hồ Ly</span>
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: 'var(--fox-ruby)', color: 'white' }}>Online</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Trợ lý học từ vựng 🌸
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', fontSize: 11, color: 'var(--muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎓</span>
            <span>Smart Lexicon Anime v2.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" style={{ display: 'none' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
