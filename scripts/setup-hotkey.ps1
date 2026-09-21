# PowerShell Script: Tạo Shortcut và cài đặt phím tắt cho Smart Lexicon
$ErrorActionPreference = "Stop"

$ProjectDir = "d:\NoteBook_English\NoteBook_English_AI"
$VbsScript = Join-Path $ProjectDir "scripts\open-lookup.vbs"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$StartMenuPath = [Environment]::GetFolderPath("Programs")

$WshShell = New-Object -ComObject WScript.Shell

# Icon nguồn (ưu tiên Brave -> Edge -> Chrome)
$IconPath = "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
if (-not (Test-Path $IconPath)) {
    $IconPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $IconPath)) {
    $IconPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $IconPath)) {
    $IconPath = "$env:SystemRoot\System32\shell32.dll"
}

# Xóa shortcut cũ nếu có
Remove-Item "$DesktopPath\*Smart Lexicon*.lnk" -ErrorAction SilentlyContinue
Remove-Item "$StartMenuPath\*Smart Lexicon*.lnk" -ErrorAction SilentlyContinue

# 1. Tạo Shortcut trên Desktop để click mở nhanh
$DesktopShortcutPath = Join-Path $DesktopPath "Smart Lexicon.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = "$env:SystemRoot\System32\wscript.exe"
$Shortcut.Arguments = "`"$VbsScript`""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.IconLocation = "$IconPath,0"
$Shortcut.Description = "Smart Lexicon - Press Ctrl + Alt + D or double click to open"
$Shortcut.WindowStyle = 7 # Minimized
$Shortcut.Save()

Write-Host "Da tao Shortcut tren Desktop: $DesktopShortcutPath" -ForegroundColor Green

# 2. Tạo Shortcut trong Start Menu
$StartMenuShortcutPath = Join-Path $StartMenuPath "Smart Lexicon.lnk"
$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$StartShortcut.TargetPath = "$env:SystemRoot\System32\wscript.exe"
$StartShortcut.Arguments = "`"$VbsScript`""
$StartShortcut.WorkingDirectory = $ProjectDir
$StartShortcut.IconLocation = "$IconPath,0"
$StartShortcut.Description = "Smart Lexicon - Press Ctrl + Alt + D to open"
$StartShortcut.WindowStyle = 7
$StartShortcut.Save()

Write-Host "Da tao Shortcut trong Start Menu: $StartMenuShortcutPath" -ForegroundColor Green

# 3. Kích hoạt bộ lắng nghe phím tắt toàn cầu (SmartLexiconHotkey.exe)
$InstallServiceScript = Join-Path $ProjectDir "scripts\install-hotkey-service.ps1"
if (Test-Path $InstallServiceScript) {
    & powershell -ExecutionPolicy Bypass -File $InstallServiceScript
}

Write-Host "`nCai dat hoan tat!" -ForegroundColor Green
Write-Host "Cac phim tat hoat dong toan he thong (khong trung Brave/Windows):" -ForegroundColor Cyan
Write-Host "  1. [Alt + Q]        (Khuyen dung nhat: 1 tay sieu nhanh)" -ForegroundColor Yellow
Write-Host "  2. [F8]             (1 cham tien loi)" -ForegroundColor Yellow
Write-Host "  3. [Ctrl + Alt + L] (L: Lookup / Lexicon)" -ForegroundColor Yellow
Write-Host "  4. [Ctrl + Alt + D] (Phim truyen thong)" -ForegroundColor Yellow
Write-Host "Ngoai ra bieu tuong icon cung da san sang tren Desktop!" -ForegroundColor Cyan
