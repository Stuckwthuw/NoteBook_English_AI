# Dọn dẹp tiến trình C# cũ và shortcut startup
Get-Process -Name "SmartLexiconHotkey" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$startupFolder = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupFolder "SmartLexiconHotkey.lnk"
if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force -ErrorAction SilentlyContinue
    Write-Host "Removed Startup shortcut: $shortcutPath"
}

# Kiểm tra xem còn tiến trình nào không
$remaining = Get-Process -Name "SmartLexiconHotkey" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Warning: Process still running with PID: $($remaining.Id)"
} else {
    Write-Host "Cleaned up successfully. No legacy hotkey daemon running."
}
