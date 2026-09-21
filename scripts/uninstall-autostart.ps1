# ==============================================================================
# Smart Lexicon AI - Huỷ tự động khởi động cùng Windows
# ==============================================================================

$startupFolder = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupFolder "SmartLexiconServer.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force -ErrorAction SilentlyContinue
    Write-Host "[THANH CONG] Da huy khoi dong cung Windows cho Smart Lexicon AI Server." -ForegroundColor Green
} else {
    Write-Host "Khong tim thay loi tat tu khoi dong." -ForegroundColor Yellow
}
