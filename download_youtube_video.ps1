# download_youtube_video.ps1

<#
.SYNOPSIS
Downloads a YouTube video using yt‑dlp.exe to a specified output path.
#>

param(
    [Parameter(Mandatory=$true)][string]$VideoUrl,
    [Parameter(Mandatory=$true)][string]$OutputPath
)

$ytDlpPath = Join-Path $PSScriptRoot "yt-dlp.exe"
if (-Not (Test-Path $ytDlpPath)) {
    Write-Error "yt‑dlp executable not found at $ytDlpPath. Run yt_dlp_install.ps1 first."
    exit 1
}

Write-Host "Downloading video from $VideoUrl..."
# Use best quality video+audio, overwrite if exists
& $ytDlpPath -f "best" -o $OutputPath $VideoUrl
if ($LASTEXITCODE -ne 0) {
    Write-Error "yt‑dlp failed to download the video."
    exit 1
}
Write-Host "Video saved to $OutputPath"
