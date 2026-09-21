using System;
using System.Runtime.InteropServices;
using System.Threading;

public class ThreadHotkeyTest {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    public struct POINT { public int x; public int y; }

    [StructLayout(LayoutKind.Sequential)]
    public struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [DllImport("user32.dll")]
    public static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    public static extern bool PostQuitMessage(int nExitCode);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    static void Main() {
        bool r1 = RegisterHotKey(IntPtr.Zero, 101, 0x4003, 0x44); // MOD_NOREPEAT | MOD_CONTROL | MOD_ALT, 'D'
        int err1 = Marshal.GetLastWin32Error();
        Console.WriteLine("RegisterHotKey Ctrl+Alt+D on IntPtr.Zero: " + r1 + " (Error: " + err1 + ")");

        bool r2 = RegisterHotKey(IntPtr.Zero, 102, 0x4006, 0x44); // MOD_NOREPEAT | MOD_CONTROL | MOD_SHIFT, 'D'
        int err2 = Marshal.GetLastWin32Error();
        Console.WriteLine("RegisterHotKey Ctrl+Shift+D on IntPtr.Zero: " + r2 + " (Error: " + err2 + ")");

        if (r1 || r2) {
            ThreadPool.QueueUserWorkItem(_ => {
                Thread.Sleep(300);
                Console.WriteLine("Simulating Ctrl+Shift+D...");
                keybd_event(0x11, 0, 0, UIntPtr.Zero); // Ctrl down
                keybd_event(0x10, 0, 0, UIntPtr.Zero); // Shift down
                keybd_event(0x44, 0, 0, UIntPtr.Zero); // D down
                Thread.Sleep(50);
                keybd_event(0x44, 0, 2, UIntPtr.Zero); // D up
                keybd_event(0x10, 0, 2, UIntPtr.Zero); // Shift up
                keybd_event(0x11, 0, 2, UIntPtr.Zero); // Ctrl up
            });

            ThreadPool.QueueUserWorkItem(_ => {
                Thread.Sleep(2000);
                PostQuitMessage(0);
            });

            MSG msg;
            while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
                if (msg.message == 0x0312) { // WM_HOTKEY
                    Console.WriteLine("SUCCESS! WM_HOTKEY received in thread message queue! Hotkey ID: " + msg.wParam);
                    break;
                }
            }

            if (r1) UnregisterHotKey(IntPtr.Zero, 101);
            if (r2) UnregisterHotKey(IntPtr.Zero, 102);
        }
    }
}
