'use client';

import React, { type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
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
      </div>
    </ToastProvider>
  );
}
