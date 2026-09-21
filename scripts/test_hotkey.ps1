$code = @"
using System;
using System.Runtime.InteropServices;

public class Win32HotKey {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool UnregisterHotKey(IntPtr hWnd, int id);
}
"@
Add-Type -TypeDefinition $code

# MOD_ALT = 1, MOD_CONTROL = 2, MOD_NOREPEAT = 0x4000
# VK_D = 0x44
$res = [Win32HotKey]::RegisterHotKey([IntPtr]::Zero, 9999, 0x4003, 0x44)
$err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()
if ($res) {
    [Win32HotKey]::UnregisterHotKey([IntPtr]::Zero, 9999)
}
Write-Host "RegisterHotKey Result: $res (Error Code: $err)"
