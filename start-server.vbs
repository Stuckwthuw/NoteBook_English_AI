Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\NoteBook_English\NoteBook_English_AI"
' Khởi chạy script kiểm tra và chạy server ẩn (không hiện bất kỳ cửa sổ nào)
WshShell.Run "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File ""d:\NoteBook_English\NoteBook_English_AI\scripts\start-server-silent.ps1""", 0, False
