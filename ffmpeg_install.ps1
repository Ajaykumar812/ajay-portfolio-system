# ffmpeg_install.ps1

<#
.SYNOPSIS
Downloads a static Windows build of ffmpeg, extracts the executable, and makes it available in the project folder.
#>

$ffmpegDir = Join-Path $PSScriptRoot "ffmpeg"
$ffmpegExe = Join-Path $ffmpegDir "bin\ffmpeg.exe"

if (Test-Path $ffmpegExe) {
    Write-Host "ffmpeg already present at $ffmpegExe"
    $env:Path = "$(Split-Path $ffmpegExe)" + ";" + $env:Path
    return
}

# Ensure destination folder exists
New-Item -ItemType Directory -Path $ffmpegDir -Force | Out-Null

$zipUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$zipPath = Join-Path $PSScriptRoot "ffmpeg.zip"

Write-Host "Downloading ffmpeg..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting ffmpeg..."
Expand-Archive -Path $zipPath -DestinationPath $ffmpegDir -Force

# Locate ffmpeg.exe in the extracted hierarchy (the zip creates a folder like ffmpeg-<hash>-essentials)
$ffmpegExeSource = Get-ChildItem -Path $ffmpegDir -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
if (-not $ffmpegExeSource) {
    Write-Error "Failed to locate ffmpeg.exe after extraction."
    exit 1
}

# Ensure bin folder exists
$binDir = Split-Path $ffmpegExe -Parent
New-Item -ItemType Directory -Path $binDir -Force | Out-Null

Copy-Item -Path $ffmpegExeSource.FullName -Destination $ffmpegExe -Force

# Clean up zip file (keep extracted folder for future runs)
Remove-Item $zipPath -Force

# Add ffmpeg folder to PATH for the current session
$env:Path = "$(Split-Path $ffmpegExe)" + ";" + $env:Path
Write-Host "ffmpeg installed to $ffmpegExe and added to PATH."
