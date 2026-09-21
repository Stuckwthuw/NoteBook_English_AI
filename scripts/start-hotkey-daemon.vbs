' Detached launcher for SmartLexiconHotkey.exe
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\NoteBook_English\NoteBook_English_AI\scripts"
WshShell.Run """d:\NoteBook_English\NoteBook_English_AI\scripts\SmartLexiconHotkey.exe""", 0, False
