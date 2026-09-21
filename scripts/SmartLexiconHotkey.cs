using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;

namespace SmartLexicon
{
    public class Program
    {
        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        [DllImport("user32.dll")]
        private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        // Win32 Constants
        public const int WM_HOTKEY = 0x0312;
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_SYSKEYDOWN = 0x0104;

        public const uint MOD_ALT = 0x0001;
        public const uint MOD_CONTROL = 0x0002;
        public const uint MOD_SHIFT = 0x0004;
        public const uint MOD_WIN = 0x0008;
        public const uint MOD_NOREPEAT = 0x4000;

        public const int HOTKEY_ID_ALT_Q = 1001;
        public const int HOTKEY_ID_F8 = 1002;
        public const int HOTKEY_ID_CTRL_ALT_L = 1003;
        public const int HOTKEY_ID_CTRL_ALT_D = 1004;
        public const int HOTKEY_ID_CTRL_F8 = 1005;

        private const byte VK_CONTROL = 0x11;
        private const byte VK_C = 0x43;
        private const uint KEYEVENTF_KEYUP = 0x0002;

        public const string PROJECT_DIR = @"d:\NoteBook_English\NoteBook_English_AI";
        public static readonly string LOG_PATH = Path.Combine(PROJECT_DIR, @"scripts\hotkey_debug.log");

        private static long _lastTriggerTick = 0;
        private static IntPtr _hookID = IntPtr.Zero;
        private static LowLevelKeyboardProc _proc = HookCallback;

        public static void Log(string msg)
        {
            try
            {
                File.AppendAllText(LOG_PATH, string.Format("[{0:yyyy-MM-dd HH:mm:ss.fff}] {1}\r\n", DateTime.Now, msg));
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            try
            {
                Log("=== SmartLexiconHotkey (Ultimate Hybrid Engine) started ===");

                bool createdNew;
                using (var mutex = new Mutex(true, "SmartLexiconHotkey_FinalMutex_V6", out createdNew))
                {
                    if (!createdNew)
                    {
                        Log("Another instance already running. Exiting duplicate.");
                        return;
                    }

                    Application.EnableVisualStyles();
                    Application.SetCompatibleTextRenderingDefault(false);

                    // Set up low level keyboard hook as fallback
                    _hookID = SetHook(_proc);
                    if (_hookID != IntPtr.Zero)
                    {
                        Log("Low-level keyboard hook installed successfully.");
                    }
                    else
                    {
                        Log("Failed to install low-level keyboard hook.");
                    }

                    Application.Run(new HotkeyAppContext());

                    if (_hookID != IntPtr.Zero)
                    {
                        UnhookWindowsHookEx(_hookID);
                    }
                }
            }
            catch (Exception ex)
            {
                Log("Main fatal exception: " + ex.ToString());
            }
        }

        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
            {
                int vkCode = Marshal.ReadInt32(lParam);
                Keys key = (Keys)vkCode;

                bool ctrlPressed = (Control.ModifierKeys & Keys.Control) != 0;
                bool altPressed = (Control.ModifierKeys & Keys.Alt) != 0;
                bool shiftPressed = (Control.ModifierKeys & Keys.Shift) != 0;

                bool triggered = false;
                string triggerName = "";

                if (key == Keys.Q && altPressed && !ctrlPressed && !shiftPressed) { triggered = true; triggerName = "Alt+Q (LL Hook)"; }
                else if (key == Keys.F8 && !altPressed && !ctrlPressed && !shiftPressed) { triggered = true; triggerName = "F8 (LL Hook)"; }
                else if (key == Keys.L && altPressed && ctrlPressed && !shiftPressed) { triggered = true; triggerName = "Ctrl+Alt+L (LL Hook)"; }
                else if (key == Keys.D && altPressed && ctrlPressed && !shiftPressed) { triggered = true; triggerName = "Ctrl+Alt+D (LL Hook)"; }
                else if (key == Keys.F8 && ctrlPressed && !altPressed && !shiftPressed) { triggered = true; triggerName = "Ctrl+F8 (LL Hook)"; }

                if (triggered)
                {
                    long now = Environment.TickCount;
                    if (now - _lastTriggerTick > 1000) // 1 second debounce
                    {
                        _lastTriggerTick = now;
                        Log(">>> Hotkey triggered via Low-Level Hook: " + triggerName);
                        TriggerLookup();
                    }
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        public static void CheckAndTriggerFromWM(int id)
        {
            long now = Environment.TickCount;
            if (now - _lastTriggerTick > 1000) // 1 second debounce
            {
                _lastTriggerTick = now;
                string keyName = "Unknown";
                if (id == HOTKEY_ID_ALT_Q) keyName = "Alt + Q";
                else if (id == HOTKEY_ID_F8) keyName = "F8";
                else if (id == HOTKEY_ID_CTRL_ALT_L) keyName = "Ctrl + Alt + L";
                else if (id == HOTKEY_ID_CTRL_ALT_D) keyName = "Ctrl + Alt + D";
                else if (id == HOTKEY_ID_CTRL_F8) keyName = "Ctrl + F8";

                Log(">>> WM_HOTKEY received! Key: [" + keyName + "] (ID: " + id + ")");
                TriggerLookup();
            }
        }

        public static void TriggerLookup()
        {
            var thread = new Thread(OpenLookupWorker);
            thread.SetApartmentState(ApartmentState.STA); // Needed for Clipboard
            thread.IsBackground = true;
            thread.Start();
        }

        public static void TriggerUrl(string url)
        {
            var thread = new Thread(() => OpenBrowser(url));
            thread.IsBackground = true;
            thread.Start();
        }

        private static void OpenLookupWorker()
        {
            try
            {
                Log("OpenLookupWorker started");
                string selectedText = "";
                try
                {
                    if (Clipboard.ContainsText())
                    {
                        selectedText = Clipboard.GetText().Trim();
                        Log("Existing clipboard content detected (length: " + selectedText.Length + ")");
                    }

                    if (string.IsNullOrEmpty(selectedText))
                    {
                        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
                        keybd_event(VK_C, 0, 0, UIntPtr.Zero);
                        Thread.Sleep(30);
                        keybd_event(VK_C, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
                        Thread.Sleep(80);

                        if (Clipboard.ContainsText())
                        {
                            selectedText = Clipboard.GetText().Trim();
                            Log("Captured text via Ctrl+C (length: " + selectedText.Length + ")");
                        }
                    }
                }
                catch (Exception clipEx)
                {
                    Log("Clipboard error (ignored): " + clipEx.Message);
                }

                string word = ExtractWord(selectedText);
                bool isLongExplanation = (!string.IsNullOrEmpty(selectedText) && selectedText.Length > 80);

                if (!string.IsNullOrEmpty(word))
                {
                    Log("Extracted word: '" + word + "' (isLongExplanation: " + isLongExplanation + ")");
                }
                else
                {
                    Log("No specific word extracted, opening lookup homepage.");
                }

                bool serverRunning = IsServerRunning();
                Log("Server localhost:3000 running check: " + serverRunning);

                if (!serverRunning)
                {
                    Log("Server not running. Launching dev server in background...");
                    var psi = new ProcessStartInfo
                    {
                        FileName = "powershell.exe",
                        Arguments = "-NoProfile -WindowStyle Hidden -Command \"Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev\"",
                        WorkingDirectory = PROJECT_DIR,
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process.Start(psi);

                    for (int i = 0; i < 16; i++)
                    {
                        Thread.Sleep(500);
                        if (IsServerRunning())
                        {
                            serverRunning = true;
                            Log("Server became ready after " + ((i + 1) * 500) + "ms");
                            break;
                        }
                    }
                }

                string url = "http://localhost:3000/lookup";
                if (!string.IsNullOrEmpty(word))
                {
                    url += "?word=" + Uri.EscapeDataString(word);
                    if (isLongExplanation)
                    {
                        url += "&paste=1";
                    }
                }

                OpenBrowser(url);
            }
            catch (Exception ex)
            {
                Log("OpenLookupWorker exception: " + ex.ToString());
            }
        }

        private static string ExtractWord(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            text = text.Trim();

            if (text.Length < 50 && !text.Contains("\n") && !text.Contains("\r"))
            {
                return text.Trim(' ', '\t', '"', '\'', '“', '”', '.', ',', ';', ':', '!', '?');
            }

            var match = Regex.Match(text, @"^([A-Za-z][A-Za-z\s\-']{1,35}?)(?=\s+(?:là|la|means|\:|\(|\/|-|–|—))", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return match.Groups[1].Value.Trim(' ', '\t', '"', '\'', '“', '”');
            }

            var firstWordMatch = Regex.Match(text, @"^[A-Za-z\-']{2,30}");
            if (firstWordMatch.Success)
            {
                return firstWordMatch.Value.Trim();
            }

            return "";
        }

        private static bool IsServerRunning()
        {
            try
            {
                using (var tcp = new TcpClient())
                {
                    var res = tcp.BeginConnect("127.0.0.1", 3000, null, null);
                    bool success = res.AsyncWaitHandle.WaitOne(300);
                    if (success && tcp.Connected)
                    {
                        tcp.EndConnect(res);
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }

        private static void OpenBrowser(string url)
        {
            try
            {
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath))
                {
                    edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                }

                Log("Launching browser for URL: " + url);

                if (File.Exists(edgePath))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = "--app=\"" + url + "\" --window-size=680,860",
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                    Log("Opened via Microsoft Edge App Mode popup.");
                }
                else
                {
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                    Log("Opened via System Default Browser.");
                }
            }
            catch (Exception ex)
            {
                Log("OpenBrowser exception: " + ex.ToString());
            }
        }
    }

    public class HotkeyAppContext : ApplicationContext
    {
        private NotifyIcon _trayIcon;
        private HiddenForm _hiddenForm;

        public HotkeyAppContext()
        {
            _hiddenForm = new HiddenForm();
            
            _trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "Smart Lexicon (Alt+Q / F8 / Ctrl+Alt+D)",
                Visible = true
            };

            var menu = new ContextMenuStrip();
            menu.Items.Add("🔍 Tra cứu nhanh (Alt+Q / F8 / Ctrl+Alt+D)", null, (s, e) => Program.TriggerLookup());
            menu.Items.Add("📖 Mở Sổ tay Từ vựng (Trang chủ)", null, (s, e) => Program.TriggerUrl("http://localhost:3000"));
            menu.Items.Add("-");
            menu.Items.Add("📄 Xem nhật ký (Debug Log)", null, (s, e) => {
                if (File.Exists(Program.LOG_PATH)) Process.Start(new ProcessStartInfo("notepad.exe", Program.LOG_PATH) { UseShellExecute = true });
            });
            menu.Items.Add("❌ Thoát", null, (s, e) => ExitThread());
            _trayIcon.ContextMenuStrip = menu;
            _trayIcon.DoubleClick += (s, e) => Program.TriggerLookup();

            try
            {
                _trayIcon.BalloonTipTitle = "Smart Lexicon Ready";
                _trayIcon.BalloonTipText = "Phím tắt:\n• [Alt+Q] hoặc [F8] hoặc [Ctrl+Alt+D]";
                _trayIcon.ShowBalloonTip(3000);
            }
            catch { }
        }

        protected override void ExitThreadCore()
        {
            if (_trayIcon != null)
            {
                _trayIcon.Visible = false;
                _trayIcon.Dispose();
            }
            if (_hiddenForm != null)
            {
                _hiddenForm.Dispose();
            }
            base.ExitThreadCore();
        }
    }

    public class HiddenForm : Form
    {
        public HiddenForm()
        {
            this.Text = "SmartLexicon_HiddenForm";
            this.WindowState = FormWindowState.Minimized;
            this.ShowInTaskbar = false;
            this.FormBorderStyle = FormBorderStyle.FixedToolWindow;
            this.Opacity = 0;
            
            // Force handle creation immediately
            var handle = this.Handle; 
        }

        protected override void SetVisibleCore(bool value)
        {
            base.SetVisibleCore(false); // Never visible
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            
            bool r1 = Program.RegisterHotKey(this.Handle, Program.HOTKEY_ID_ALT_Q, Program.MOD_ALT | Program.MOD_NOREPEAT, (uint)Keys.Q);
            bool r2 = Program.RegisterHotKey(this.Handle, Program.HOTKEY_ID_F8, Program.MOD_NOREPEAT, (uint)Keys.F8);
            bool r3 = Program.RegisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_ALT_L, Program.MOD_CONTROL | Program.MOD_ALT | Program.MOD_NOREPEAT, (uint)Keys.L);
            bool r4 = Program.RegisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_ALT_D, Program.MOD_CONTROL | Program.MOD_ALT | Program.MOD_NOREPEAT, (uint)Keys.D);
            bool r5 = Program.RegisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_F8, Program.MOD_CONTROL | Program.MOD_NOREPEAT, (uint)Keys.F8);

            Program.Log(string.Format("Hotkeys registered on HiddenForm -> [Alt+Q]: {0}, [F8]: {1}, [Ctrl+Alt+L]: {2}, [Ctrl+Alt+D]: {3}, [Ctrl+F8]: {4}", r1, r2, r3, r4, r5));
        }

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == Program.WM_HOTKEY)
            {
                Program.CheckAndTriggerFromWM(m.WParam.ToInt32());
            }
            base.WndProc(ref m);
        }
        
        protected override void Dispose(bool disposing)
        {
            Program.UnregisterHotKey(this.Handle, Program.HOTKEY_ID_ALT_Q);
            Program.UnregisterHotKey(this.Handle, Program.HOTKEY_ID_F8);
            Program.UnregisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_ALT_L);
            Program.UnregisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_ALT_D);
            Program.UnregisterHotKey(this.Handle, Program.HOTKEY_ID_CTRL_F8);
            base.Dispose(disposing);
        }
    }
}
