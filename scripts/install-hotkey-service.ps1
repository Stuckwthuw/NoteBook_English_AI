# Install and start SmartLexiconHotkey
$StartupFolder = [Environment]::GetFolderPath('Startup')
$ExePath = "d:\NoteBook_English\NoteBook_English_AI\scripts\SmartLexiconHotkey.exe"
$WorkingDir = "d:\NoteBook_English\NoteBook_English_AI\scripts"

# 1. Add to Windows Startup folder
$WshShell = New-Object -ComObject WScript.Shell
$StartupShortcut = $WshShell.CreateShortcut((Join-Path $StartupFolder "SmartLexiconHotkey.lnk"))
$StartupShortcut.TargetPath = $ExePath
$StartupShortcut.WorkingDirectory = $WorkingDir
$StartupShortcut.Description = "Smart Lexicon Global Hotkey Daemon"
$StartupShortcut.Save()

Write-Host "Da them vao Windows Startup: $StartupFolder\SmartLexiconHotkey.lnk" -ForegroundColor Green

# 2. Stop old instances
Get-Process -Name "SmartLexiconHotkey" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 400

# 3. Start new instance via explorer.exe (to detach from terminal job object)
Start-Process "explorer.exe" -ArgumentList "`"$ExePath`""
Start-Sleep -Milliseconds 1500

# 4. Check process
$proc = Get-Process -Name "SmartLexiconHotkey" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) {
    Write-Host "SmartLexiconHotkey is RUNNING (PID: $($proc.Id))" -ForegroundColor Green
    Write-Host "Active Conflict-Free Hotkeys:" -ForegroundColor Cyan
    Write-Host "  1. [Alt + Q]        (Khuyen dung nhat: 1 tay sieu nhanh)" -ForegroundColor Yellow
    Write-Host "  2. [F8]             (1 cham tien loi)" -ForegroundColor Yellow
    Write-Host "  3. [Ctrl + Alt + L] (L: Lookup / Lexicon)" -ForegroundColor Yellow
    Write-Host "  4. [Ctrl + Alt + D] (Phim truyen thong)" -ForegroundColor Yellow
} else {
    Write-Host "Could not start process." -ForegroundColor Red
}
