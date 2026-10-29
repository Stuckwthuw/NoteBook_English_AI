'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export type MascotEmotion = 'idle' | 'happy' | 'thinking' | 'encourage' | 'celebrate';

interface MascotContextType {
  emotion: MascotEmotion;
  message: string;
  isMascotVisible: boolean;
  isMinimized: boolean;
  triggerEmotion: (emotion: MascotEmotion, customMessage?: string, durationMs?: number) => void;
  interact: () => void;
  toggleVisibility: () => void;
  toggleMinimize: () => void;
}

const DEFAULT_GREETINGS = [
  'Chào bạn nha! Thiếp là Bạch Hồ Ly, hôm nay cùng thiếp chinh phục tiếng Anh nhé! 🦊✨',
  'Mỗi ngày một từ vựng mới, tri thức sẽ tích lũy như biển lớn! 🌸',
  'Ngươi cần thiếp giúp đỡ phát âm hay phân tích ngữ cảnh không? 🏮',
  'Hãy luyện nói thật to và rõ ràng, thiếp đang lắng nghe nè! 🎙️💖',
  'Chăm chỉ ôn tập ngắt quãng sẽ giúp ghi nhớ sâu sắc vào tiềm thức! 📜✨',
];

const INTERACTION_QUOTES = [
  'Đừng chạm vào tai thiếp nha... nhột lắm đó! 🦊🏮',
  'Ngươi học rất chăm chỉ, thiếp rất hài lòng~ Hôm nay muốn tra từ gì nè? 💖',
  'Phát âm tiếng Anh chuẩn xác tựa như kiếm khí sắc bén vậy! 🌸⚔️',
  'Cứ mỗi lần ngươi thuộc một từ, đuôi thiếp lại vẫy một nhịp vui sướng! ✨',
  'Kiên trì là con đường duy nhất dẫn đến cảnh giới tinh thông ngôn ngữ! 📜🦊',
  'Nếu thấy mệt thì hít thở sâu một hơi nhé, thiếp luôn ở đây đồng hành cùng ngươi! 🍵🌸',
];

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const [emotion, setEmotion] = useState<MascotEmotion>('idle');
  const [message, setMessage] = useState<string>(DEFAULT_GREETINGS[0]);
  const [isMascotVisible, setIsMascotVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo ngẫu nhiên lời chào buổi
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setMessage('Chào buổi sáng! Cùng thiếp khởi động ngày mới tràn đầy năng lượng với từ vựng mới nha! ☀️🦊');
    } else if (hour < 18) {
      setMessage('Buổi chiều an lành! Dành chút thời gian ôn lại vài từ vựng nhé bạn ơi! 🌸🍵');
    } else {
      setMessage('Buổi tối yên tĩnh rất thích hợp để lắng đọng và ghi nhớ từ mới đó! 🌙🏮');
    }

    // Đọc trạng thái từ localStorage an toàn
    try {
      const savedVisible = localStorage.getItem('lexicon_mascot_visible');
      if (savedVisible !== null) setIsMascotVisible(savedVisible === 'true');
      const savedMini = localStorage.getItem('lexicon_mascot_mini');
      if (savedMini !== null) setIsMinimized(savedMini === 'true');
    } catch {
      // ignore
    }
  }, []);

  const triggerEmotion = useCallback(
    (newEmotion: MascotEmotion, customMessage?: string, durationMs: number = 5000) => {
      setEmotion(newEmotion);
      if (customMessage) {
        setMessage(customMessage);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Trở về idle sau thời gian duration
      timerRef.current = setTimeout(() => {
        setEmotion('idle');
      }, durationMs);
    },
    []
  );

  const interact = useCallback(() => {
    const randomQuote = INTERACTION_QUOTES[Math.floor(Math.random() * INTERACTION_QUOTES.length)];
    triggerEmotion('happy', randomQuote, 4500);
  }, [triggerEmotion]);

  const toggleVisibility = useCallback(() => {
    setIsMascotVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lexicon_mascot_visible', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lexicon_mascot_mini', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <MascotContext.Provider
      value={{
        emotion,
        message,
        isMascotVisible,
        isMinimized,
        triggerEmotion,
        interact,
        toggleVisibility,
        toggleMinimize,
      }}
    >
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within MascotProvider');
  }
  return context;
}

