Add-Type -AssemblyName System.Drawing

$root = "C:\Users\javops\Documents\Default Project\javops-site"
$shot = Join-Path $root "public\img\games\arc-raiders-shot.jpg"
$out  = Join-Path $root "public\og.jpg"

$w = 1200; $h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 11, 13))
$g.FillRectangle($bg, 0, 0, $w, $h)

$img = [System.Drawing.Image]::FromFile($shot)
$scale = [Math]::Max($w / $img.Width, $h / $img.Height)
$dw = [int]($img.Width * $scale)
$dh = [int]($img.Height * $scale)
$dx = [int](($w - $dw) / 2)
$dy = [int](($h - $dh) / 2)
$g.DrawImage($img, $dx, $dy, $dw, $dh)

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$c1 = [System.Drawing.Color]::FromArgb(248, 8, 9, 11)
$c2 = [System.Drawing.Color]::FromArgb(238, 8, 9, 11)
$c3 = [System.Drawing.Color]::FromArgb(70, 8, 9, 11)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c3, 0.0)
$blend = New-Object System.Drawing.Drawing2D.ColorBlend(3)
$blend.Colors = @($c1, $c2, $c3)
$blend.Positions = @(0.0, 0.55, 1.0)
$brush.InterpolationColors = $blend
$g.FillRectangle($brush, $rect)

$framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(38, 255, 255, 255), 1)
$g.DrawRectangle($framePen, 28, 28, $w - 57, $h - 57)

$left = 76

$accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(127, 159, 196))
$g.FillRectangle($accent, $left, 78, 10, 10)
$mono = New-Object System.Drawing.Font("Consolas", 15, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(168, 172, 180))
$g.DrawString("ЛИЧНАЯ СТРАНИЦА  /  2026", $mono, $muted, ($left + 22), 73)

$title = New-Object System.Drawing.Font("Segoe UI", 118, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 240, 238))
$g.DrawString("javops", $title, $white, ($left - 4), 150)

$sub = New-Object System.Drawing.Font("Segoe UI", 27, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(196, 199, 205))
$g.DrawString("Игры. Железо. Эксперименты.", $sub, $soft, ($left + 2), 300)

$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(127, 159, 196), 2)
$g.DrawLine($linePen, ($left + 2), 368, ($left + 122), 368)

$small = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 145, 154))
$g.DrawString("Steam: javops / javierping", $small, $dim, ($left + 2), 400)
$g.DrawString("RX 6900 XT  ·  Ryzen 9000  ·  32 GB DDR5", $small, $dim, ($left + 2), 430)

$sig = New-Object System.Drawing.Font("Consolas", 14, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$sigBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 124, 132))
$text = "ARC RAIDERS  /  STEAM CDN"
$measure = $g.MeasureString($text, $sig)
$g.DrawString($text, $sig, $sigBrush, ($w - 60 - $measure.Width), ($h - 66))

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)
$bmp.Save($out, $codec, $params)

$g.Dispose(); $bmp.Dispose(); $img.Dispose()
"og.jpg: $([math]::Round((Get-Item $out).Length / 1KB)) KB"
