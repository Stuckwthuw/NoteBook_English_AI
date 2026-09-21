; ==============================================================================
; Smart Lexicon Notebook - AutoHotkey Quick Lookup Tool
; Phím tắt: Ctrl + Alt + D
; Tính năng: Bôi đen từ ở bất kỳ đâu (Web, PDF, Word) -> Bấm Ctrl + Alt + D
; -> Hệ thống tự động copy và mở ngay trang tra từ vựng đó!
; ==============================================================================

#Requires AutoHotkey v2.0+

^!d:: ; Ctrl + Alt + D
{
    ; 1. Lưu lại nội dung clipboard hiện tại
    oldClip := A_Clipboard
    A_Clipboard := ""

    ; 2. Gửi lệnh copy để lấy từ đang được bôi đen
    Send("^c")
    
    ; Đợi clipboard có dữ liệu (tối đa 250ms)
    word := ""
    if (ClipWait(0.25)) {
        selected := Trim(A_Clipboard)
        ; Nếu chuỗi ngắn và không chứa ký tự xuống dòng nhiều (tối đa 80 ký tự)
        if (StrLen(selected) > 0 and StrLen(selected) < 80 and !InStr(selected, "`n")) {
            word := selected
        }
    }

    ; 3. Khôi phục lại clipboard ban đầu cho người dùng
    A_Clipboard := oldClip

    ; 4. Tạo URL
    if (word != "") {
        encodedWord := word ; Có thể dùng URL encode nếu cần
        targetUrl := "http://localhost:3000/lookup?word=" . encodedWord
    } else {
        targetUrl := "http://localhost:3000/lookup"
    }

    ; 5. Mở bằng Chrome hoặc Edge ở chế độ Cửa sổ App (App Mode)
    chromePath := "C:\Program Files\Google\Chrome\Application\chrome.exe"
    edgePath := "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    if (FileExist(chromePath)) {
        Run('"' . chromePath . '" --app="' . targetUrl . '" --window-size=680,860')
    } else if (FileExist(edgePath)) {
        Run('"' . edgePath . '" --app="' . targetUrl . '" --window-size=680,860')
    } else {
        Run(targetUrl)
    }
}
