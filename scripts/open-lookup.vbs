' Smart Lexicon Notebook - Silent Launcher
Option Explicit

Dim WshShell, fso, projectDir, edgePath, bravePath, chromePath, targetUrl
Dim http, isAlive, i

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = "d:\NoteBook_English\NoteBook_English_AI"
WshShell.CurrentDirectory = projectDir

targetUrl = "http://localhost:3000/lookup"

' 1. Kiem tra xem server localhost:3000 da chay chua (su dung ServerXMLHTTP rat nhanh, 10ms)
isAlive = False
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
If Err.Number <> 0 Then
    Set http = CreateObject("MSXML2.ServerXMLHTTP")
End If
http.setTimeouts 500, 500, 500, 1000
http.open "GET", "http://127.0.0.1:3000/lookup", False
http.send
If Err.Number = 0 Then
    If http.status = 200 Then
        isAlive = True
    End If
End If
On Error GoTo 0

' Neu chua chay, bat server ngam
If Not isAlive Then
    WshShell.Run "powershell -NoProfile -WindowStyle Hidden -Command ""Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev""", 0, False
    ' Doi mot chut de server san sang (toi da 8s)
    For i = 1 To 16
        WScript.Sleep 500
        On Error Resume Next
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        http.setTimeouts 300, 300, 300, 500
        http.open "GET", "http://127.0.0.1:3000/lookup", False
        http.send
        If Err.Number = 0 And http.status = 200 Then
            Exit For
        End If
        On Error GoTo 0
    Next
End If

' 2. Mo cua so Tra cuu (Uu tien Microsoft Edge o che do App Mode vi ho tro bung cua so doc lap 100% tren moi ban Windows)
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
If Not fso.FileExists(edgePath) Then
    edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If
bravePath = "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

If fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=""" & targetUrl & """ --window-size=680,860", 1, False
ElseIf fso.FileExists(bravePath) Then
    WshShell.Run """" & bravePath & """ --new-window """ & targetUrl & """", 1, False
Else
    WshShell.Run targetUrl, 1, False
End If
