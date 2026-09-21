# ==============================================================================
# Smart Lexicon AI - Tự động khởi động máy chủ cùng Windows
# ==============================================================================

$projectDir = "d:\NoteBook_English\NoteBook_English_AI"
$targetVbs = Join-Path $projectDir "start-server.vbs"

$startupFolder = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupFolder "SmartLexiconServer.lnk"

try {
    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "wscript.exe"
    $shortcut.Arguments = "`"$targetVbs`""
    $shortcut.WorkingDirectory = $projectDir
    $shortcut.Description = "Smart Lexicon AI Server - Tu dong chay ngam cung Windows"
    $shortcut.WindowStyle = 7 # Minimized / Hidden
    $shortcut.Save()

    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "[THANH CONG] Da cai dat khoi dong cung Windows!" -ForegroundColor Green
    Write-Host "Loi tat: $shortcutPath" -ForegroundColor Yellow
    Write-Host "Muc tieu: $targetVbs" -ForegroundColor Yellow
    Write-Host "Tu bay gio, moi khi bat may tinh, may chu tu dien AI se tu dong chay ngam." -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
} catch {
    Write-Host "[LOI] Khong the tao loi tat: $_" -ForegroundColor Red
}
