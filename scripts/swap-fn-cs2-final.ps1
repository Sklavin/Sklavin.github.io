Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Shot($src, $dst) {
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap(1600, 900)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, 1600, 900)
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]82)
  $bmp.Save((Join-Path (Get-Location) $dst), $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

Save-Shot 'C:\Users\javops\Downloads\apps.34062.14175760236526720.68edb414-362b-4d2c-8e5c-e1c11a693b43.jpg' 'public\img\games\fortnite-wide.jpg'
Save-Shot 'C:\Users\javops\Downloads\8aNDCyui6ac33jDZKXKFsW.jpg' 'public\img\games\cs2-shot.jpg'

Get-ChildItem public\img\games\fortnite-wide.jpg,public\img\games\cs2-shot.jpg |
  ForEach-Object { "$($_.Name): $([math]::Round($_.Length/1KB)) KB" }
