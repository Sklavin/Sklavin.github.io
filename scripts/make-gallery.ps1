param(
  [string]$Source = 'C:\Users\javops\Downloads\Telegram Desktop'
)

Add-Type -AssemblyName System.Drawing

$src = $Source
$site = Split-Path -Parent $PSScriptRoot
$out = Join-Path $site 'public\img\gallery'
$smOut = Join-Path $out 'sm'
$data = Join-Path $site 'src\data\gallery.ts'
$cache = Join-Path $PSScriptRoot '.cache'
New-Item -ItemType Directory -Force -Path $out, $cache, $smOut | Out-Null
Get-ChildItem $out -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem $smOut -File -ErrorAction SilentlyContinue | Remove-Item -Force

$exclude = @(
  'photo_4_2026-11-18_18-31-33.jpg',
  'photo_6_2026-11-18_18-31-33.jpg'
)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

$files = Get-ChildItem $src -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } |
  Where-Object { $exclude -notcontains $_.Name } |
  Sort-Object { [int]($_.Name -replace '^photo_(\d+)_.*$', '$1') }

$items = @()
$i = 0
foreach ($f in $files) {
  $i++
  $img = [System.Drawing.Image]::FromFile($f.FullName)
  $scale = [Math]::Min(1500 / $img.Width, 1500 / $img.Height)
  if ($scale -gt 1) { $scale = 1 }
  $w = [int][Math]::Round($img.Width * $scale)
  $h = [int][Math]::Round($img.Height * $scale)

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)

  $name = '{0:D2}.jpg' -f $i
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]80
  )
  $bmp.Save((Join-Path $out $name), $codec, $params)

  $smScale = [Math]::Min(1.0, [Math]::Min(720.0 / $w, 720.0 / $h))
  $sw = [Math]::Max(1, [int][Math]::Round($w * $smScale))
  $sh = [Math]::Max(1, [int][Math]::Round($h * $smScale))
  $sm = New-Object System.Drawing.Bitmap($sw, $sh)
  $gs = [System.Drawing.Graphics]::FromImage($sm)
  $gs.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gs.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gs.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gs.DrawImage($bmp, 0, 0, $sw, $sh)
  $smParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $smParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]78
  )
  $sm.Save((Join-Path $smOut $name), $codec, $smParams)

  $gs.Dispose()
  $sm.Dispose()
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()

  $items += [pscustomobject]@{ file = $name; width = $w; height = $h }
}

$items | ConvertTo-Json | Set-Content (Join-Path $cache 'gallery.json') -Encoding UTF8

$lines = @(
  'export type GalleryPhoto = {'
  '  id: string;'
  '  src: string;'
  '  width: number;'
  '  height: number;'
  '  alt: string;'
  '};'
  ''
  'export const gallery: GalleryPhoto[] = ['
)
foreach ($item in $items) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($item.file)
  $lines += "  { id: 'g$base', src: 'gallery/$($item.file)', width: $($item.width), height: $($item.height), alt: 'Личный снимок — $base' },"
}
$lines += '];'
$lines -join [Environment]::NewLine | Set-Content $data -Encoding UTF8

$total = (Get-ChildItem $out -File | Measure-Object Length -Sum).Sum
"gallery: $i files, $([math]::Round($total / 1MB, 2)) MB"
