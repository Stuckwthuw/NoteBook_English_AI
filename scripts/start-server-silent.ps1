# Kiểm tra nếu server đã chạy trên cổng 3000 thì bỏ qua
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if (-not $conn) {
    $projectDir = "d:\NoteBook_English\NoteBook_English_AI"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $projectDir -WindowStyle Hidden
    Write-Host "Smart Lexicon AI Server started in background."
} else {
    Write-Host "Smart Lexicon AI Server is already running on port 3000."
}
