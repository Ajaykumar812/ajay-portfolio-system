# generate_dummy_video.ps1

<#
.SYNOPSIS
Creates a simple placeholder video using ffmpeg.
#>

param(
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [int]$Duration = 5,            # seconds
    [string]$Resolution = "1280x720",
    [string]$BackgroundColor = "blue",
    [string]$Text = "Generated Video",
    [string]$FontColor = "white",
    [int]$FontSize = 48
)

# Use local bundled ffmpeg
$FFmpegPath = Join-Path $PSScriptRoot "ffmpeg\bin\ffmpeg.exe"
if (-Not (Test-Path $FFmpegPath)) {
    $FFmpegPath = "ffmpeg"
}

function Ensure-FFmpeg {
    try { & $FFmpegPath -version > $null 2>&1 } catch { Write-Error "ffmpeg not found at $FFmpegPath. Install it first."; exit 1 }
}

Write-Host "DEBUG: Duration: '$Duration'"
Write-Host "DEBUG: Resolution: '$Resolution'"
Write-Host "DEBUG: BackgroundColor: '$BackgroundColor'"
Write-Host "DEBUG: OutputPath: '$OutputPath'"

Ensure-FFmpeg

# Generate video without font dependency (color background + sine audio)
# This avoids arial.ttf / fontfile issues that cause silent failures
Write-Host "Generating dummy video at $OutputPath..."
& $FFmpegPath -y `
    -f lavfi -i "color=c=${BackgroundColor}:s=${Resolution}:d=${Duration}" `
    -f lavfi -i "sine=frequency=440:duration=${Duration}" `
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p `
    -c:a aac -b:a 128k `
    -shortest $OutputPath

if ($LASTEXITCODE -ne 0) { Write-Error "ffmpeg failed to generate video."; exit 1 }
Write-Host "Dummy video created successfully."
