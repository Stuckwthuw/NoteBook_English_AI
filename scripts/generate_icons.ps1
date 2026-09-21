Add-Type -AssemblyName System.Drawing

$iconDir = "d:\NoteBook_English\NoteBook_English_AI\extension\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

$sizes = @(16, 48, 128)
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $p1 = New-Object System.Drawing.Point 0, 0
    $p2 = New-Object System.Drawing.Point $s, $s
    $c1 = [System.Drawing.Color]::FromArgb(79, 70, 229)
    $c2 = [System.Drawing.Color]::FromArgb(124, 58, 237)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2

    $g.FillEllipse($brush, 0, 0, $s - 1, $s - 1)

    $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $fontSize = [Math]::Max(6, [int]($s * 0.42))
    $font = [System.Drawing.Font]::new("Arial", [float]$fontSize, [System.Drawing.FontStyle]::Bold)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF 0, 0, $s, $s
    $g.DrawString("AI", $font, $white, $rect, $sf)

    $outPath = Join-Path $iconDir "icon$s.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outPath"
}
