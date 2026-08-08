# generate_thumbnail.ps1

<#
.SYNOPSIS
Creates a thumbnail image for a video using the first frame (or a specific image) and saves it as a JPEG.
#>

param(
    [Parameter(Mandatory=$true)][string]$VideoPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [int]$Width = 320,
    [int]$Height = 180
)

if (-Not (Test-Path $VideoPath)) {
    Write-Error "Video file not found: $VideoPath"
    exit 1
}

# Find ffmpeg executable
$ffmpegExe = "ffmpeg"
if (-not (Get-Command $ffmpegExe -ErrorAction SilentlyContinue)) {
    $localFfmpeg = Join-Path $PSScriptRoot "ffmpeg\bin\ffmpeg.exe"
    if (Test-Path $localFfmpeg) {
        $ffmpegExe = $localFfmpeg
    }
}

# Use ffmpeg to extract the first frame and resize it
& $ffmpegExe -y -i $VideoPath -vf "thumbnail,scale=${Width}:${Height}" -frames:v 1 $OutputPath

Write-Host "Thumbnail generated at $OutputPath"
