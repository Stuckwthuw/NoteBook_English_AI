'use client';

import React, { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { MascotProvider } from '@/context/MascotContext';
import { AnimeMascot } from '@/components/anime/AnimeMascot';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <MascotProvider>
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
          <Sidebar />
          <main
            className="main-content"
            style={{
              flex: 1,
              marginLeft: 260,
              padding: '0 32px 40px',
              maxWidth: 900,
              minHeight: '100vh',
            }}
          >
            {children}
          </main>
          {/* Nhân vật Anime Hồ Ly Đồng Hành */}
          <AnimeMascot />
        </div>
      </MascotProvider>
    </ToastProvider>
  );
}
