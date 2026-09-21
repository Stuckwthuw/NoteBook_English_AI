Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\NoteBook_English\NoteBook_English_AI"
' Khởi chạy npm run dev hoàn toàn ẩn (không hiện cửa sổ đen cmd)
WshShell.Run "cmd /c npm run dev", 0, False
