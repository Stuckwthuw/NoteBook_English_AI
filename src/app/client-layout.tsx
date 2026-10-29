'use client';

import React, { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { MascotProvider } from '@/context/MascotContext';
import { AnimeMascot } from '@/components/anime/AnimeMascot';
import { SakuraCanvas } from '@/components/anime/SakuraCanvas';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <MascotProvider>
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
          {/* Cánh hoa anh đào rơi nhẹ trên nền ứng dụng */}
          <SakuraCanvas />

          <Sidebar />

          <main
            className="main-content"
            style={{
              flex: 1,
              marginLeft: 260,
              padding: '0 32px 40px',
              maxWidth: 900,
              minHeight: '100vh',
              position: 'relative',
              zIndex: 2, // Đảm bảo nổi trên cánh hoa anh đào
            }}
          >
            {children}
          </main>

          {/* Nhân vật Bùa Hộ Mệnh Bạch Hồ Ly (Gắn mép phải, không che nút) */}
          <AnimeMascot />
        </div>
      </MascotProvider>
    </ToastProvider>
  );
}
