'use client';

import React from 'react';
import Link from 'next/link';
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

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', fontSize: 11, color: 'var(--muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎓</span>
            <span>Smart Lexicon v1.0</span>
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
