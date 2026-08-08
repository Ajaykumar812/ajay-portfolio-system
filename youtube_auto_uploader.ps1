
param(
    [switch]$AutoAI
)

<#
.SYNOPSIS
Automates AI/ML‑driven video generation and upload to YouTube.

.REQUIREMENTS
- PowerShell 5.1 or later
- ffmpeg (installed automatically if missing)
- Python 3.9+ with a virtual environment (install_python_deps.ps1 handles this)
- Google YouTube Data API OAuth credentials (client_id, client_secret) in youtube_config.json
- Optional: gTTS for audio, Stable Diffusion for images
#>

# Load configuration
$ConfigPath = Join-Path -Path $PSScriptRoot -ChildPath 'youtube_config.json'
if (-Not (Test-Path $ConfigPath)) {
    Write-Error "Configuration file not found at $ConfigPath. Please create it based on the template."
    exit 1
}
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

# ---------------------------------------------------------------
# Logging helper (writes to automation.log and console)
# ---------------------------------------------------------------
$LogFile = Join-Path $PSScriptRoot 'automation.log'
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "$timestamp - $Message"
    Add-Content -Path $LogFile -Value $entry -Encoding UTF8
    Write-Host $Message
}

# ---------------------------------------------------------------
# Helper: Ensure ffmpeg is available (install if missing)
# ---------------------------------------------------------------
# Path to local bundled ffmpeg
$FFmpegPath = Join-Path $PSScriptRoot "ffmpeg\bin\ffmpeg.exe"
if (-Not (Test-Path $FFmpegPath)) {
    $FFmpegPath = "ffmpeg"
}

function Ensure-FFmpeg {
    if (Test-Path $FFmpegPath) {
        Write-Log "Using local ffmpeg at: $FFmpegPath"
    } elseif (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
        Write-Log "ffmpeg is available in PATH."
    } else {
        Write-Log "ffmpeg not found in PATH. Importing/Installing..."
        . "$PSScriptRoot\ffmpeg_install.ps1"
    }
}

# ---------------------------------------------------------------
# Helper: Acquire a fresh access token using the stored refresh token
# ---------------------------------------------------------------
function Get-AccessToken {
    param(
        [string]$ClientId,
        [string]$ClientSecret,
        [string]$RefreshToken
    )
    $TokenUri = "https://oauth2.googleapis.com/token"
    $Body = [ordered]@{
        client_id = $ClientId
        client_secret = $ClientSecret
        refresh_token = $RefreshToken
        grant_type = "refresh_token"
    }
    $Response = Invoke-RestMethod -Method Post -Uri $TokenUri -ContentType "application/x-www-form-urlencoded" -Body $Body
    return $Response.access_token
}

# ---------------------------------------------------------------
# Helper: Initiate OAuth flow if no refresh token is present
# ---------------------------------------------------------------
function Ensure-AuthToken {
    if ([string]::IsNullOrWhiteSpace($Config.refresh_token)) {
        Write-Log "No refresh token stored. Starting OAuth consent flow..."
        . "$PSScriptRoot\youtube_oauth_helper.ps1" -ConfigPath $ConfigPath
        $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
    }
    $AccessToken = Get-AccessToken -ClientId $Config.client_id -ClientSecret $Config.client_secret -RefreshToken $Config.refresh_token
    return $AccessToken
}

# ---------------------------------------------------------------
# Helper: Generate video from images (and optional audio)
# ---------------------------------------------------------------
function Generate-Video {
    param(
        [string]$ImageFolder,
        [string]$AudioFile,
        [string]$OutputPath,
        [string]$Resolution = "1920x1080",
        [int]$BitrateKbps = 5000,
        [int]$Framerate = 30,
        [int]$DurationSeconds = 10
    )
    $ImageFiles = Get-ChildItem -Path $ImageFolder -File | Sort-Object Name
    if ($ImageFiles.Count -eq 0) { Write-Log "No images found in $ImageFolder"; exit 1 }
    $ListFile = Join-Path $env:TEMP "ffmpeg_image_list.txt"
    $ImgDuration = [math]::Round($DurationSeconds / $ImageFiles.Count, 2)
    $ListFileContent = [System.Collections.Generic.List[string]]::new()
    for ($i = 0; $i -lt $ImageFiles.Count; $i++) {
        $ListFileContent.Add("file '$($ImageFiles[$i].FullName.Replace('\', '/'))'")
        $ListFileContent.Add("duration $ImgDuration")
    }
    $ListFileContent.Add("file '$($ImageFiles[-1].FullName.Replace('\', '/'))'")
    [System.IO.File]::WriteAllLines($ListFile, $ListFileContent)
    $TempVideo = [IO.Path]::Combine([IO.Path]::GetDirectoryName($OutputPath), "temp_video.mp4")
    Write-Log "Generating video from images..."
    & $FFmpegPath -y -f concat -safe 0 -i $ListFile -r $Framerate -c:v libx264 -preset ultrafast -b:v "${BitrateKbps}k" -pix_fmt yuv420p -s $Resolution $TempVideo
    if (-Not (Test-Path $TempVideo)) { Write-Log "Failed to generate video."; exit 1 }
    if ($AudioFile -and (Test-Path $AudioFile)) {
        Write-Log "Merging and looping audio..."
        & $FFmpegPath -y -i $TempVideo -stream_loop -1 -i $AudioFile -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest $OutputPath
        Remove-Item $TempVideo
    } else {
        Move-Item -Path $TempVideo -Destination $OutputPath -Force
    }
    Write-Log "Video generated at $OutputPath"
}

# ---------------------------------------------------------------
# Helper: Upload video to YouTube (resumable upload)
# ---------------------------------------------------------------
function Upload-Video {
    param(
        [string]$FilePath,
        [string]$Title,
        [string]$Description,
        [string[]]$Tags,
        [string]$PrivacyStatus,
        [string]$AccessToken
    )
    $UploadUrl = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable"
    $Headers = @{ Authorization = "Bearer $AccessToken"; "X-Upload-Content-Type" = "video/mp4"; "X-Upload-Content-Length" = (Get-Item $FilePath).Length }
    $Snippet = @{ title = $Title; description = $Description; tags = $Tags }
    $Status = @{ privacyStatus = $PrivacyStatus }
    $Body = @{ snippet = $Snippet; status = $Status } | ConvertTo-Json -Depth 5
    $InitResponse = Invoke-WebRequest -UseBasicParsing -Method Post -Uri $UploadUrl -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $Body -ErrorAction Stop
    $Location = $InitResponse.Headers['Location']
    if (-not $Location) { Write-Log "Failed to obtain upload URL."; exit 1 }
    $FileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $UploadHeaders = @{ Authorization = "Bearer $AccessToken"; "Content-Type" = "video/mp4"; "Content-Length" = $FileBytes.Length }
    $UploadResult = Invoke-RestMethod -Method Put -Uri $Location -Headers $UploadHeaders -Body $FileBytes -ErrorAction Stop
    Write-Log "Upload successful. Video ID: $($UploadResult.id)"
    return $UploadResult.id
}

# ---------------------------------------------------------------
# Helper: Upload thumbnail to YouTube
# ---------------------------------------------------------------
function Upload-Thumbnail {
    param(
        [string]$VideoId,
        [string]$ThumbnailPath,
        [string]$AccessToken
    )
    $ThumbUrl = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=$VideoId"
    $Headers = @{ Authorization = "Bearer $AccessToken" }
    $FileBytes = [System.IO.File]::ReadAllBytes($ThumbnailPath)
    $UploadHeaders = @{ Authorization = "Bearer $AccessToken"; "Content-Type" = "image/jpeg"; "Content-Length" = $FileBytes.Length }
    $Result = Invoke-RestMethod -Method Post -Uri $ThumbUrl -Headers $UploadHeaders -Body $FileBytes -ErrorAction Stop
    Write-Log "Thumbnail uploaded for video $VideoId"
}

# ---------------------------------------------------------------
# Main Execution Flow (supports optional AI/ML mode)
# ---------------------------------------------------------------

Ensure-FFmpeg
$AccessToken = Ensure-AuthToken

$OutputPath = [System.IO.Path]::GetFullPath($Config.output_path)

if ($AutoAI) {
    Write-Log "=== AI/ML automated video creation ==="
    # Install Python deps (creates venv if absent)
    . "$PSScriptRoot\install_python_deps.ps1"
    # Get trending topic
    $Topic = & "$PSScriptRoot\generate_trending_topic.ps1"
    Write-Log "Trending topic: $Topic"
    # Optional TTS
    $AudioPath = $null
    $SpeechText = "Trending video about $Topic"
    $venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
    if ($Config.tts_enabled) {
        $AudioPath = Join-Path $PSScriptRoot "tts.mp3"
        # If script generation is enabled, generate script first and use it for TTS
        if ($Config.script_generation_enabled) {
            # Generate script using deep learning model
            $ScriptPath = Join-Path $PSScriptRoot "script_generator.py"
            $script_output = & $venvPython $ScriptPath --prompt "$Topic" --max_length 100
            $SpeechText = $script_output.Trim()
        }
        & $venvPython "$PSScriptRoot\tts_generator.py" --text "$SpeechText" --output_path $AudioPath --lang "hi"
    }

    # Generate MJO style slide images
    $ImageDir = Join-Path $PSScriptRoot "ai_images"
    New-Item -ItemType Directory -Path $ImageDir -Force | Out-Null
    & $venvPython "$PSScriptRoot\generate_mjo_animation.py" --prompt "$SpeechText" --output_dir "$ImageDir"
    $OutputPath = [System.IO.Path]::GetFullPath($Config.output_path)
    $ImageCount = 0
    if (Test-Path $ImageDir) {
        $ImageCount = (Get-ChildItem -Path $ImageDir -File).Count
    }
    if ($ImageCount -gt 0) {
        Generate-Video -ImageFolder $ImageDir -AudioFile $AudioPath -OutputPath $OutputPath -Resolution $Config.resolution -BitrateKbps $Config.bitrate_kbps -Framerate $Config.framerate -DurationSeconds $Config.duration_seconds
    } else {
        Write-Log "AI Image Generation yielded 0 images. Creating a placeholder dummy video instead."
        $TempVideo = [IO.Path]::Combine([IO.Path]::GetDirectoryName($OutputPath), "temp_video.mp4")
        & "$PSScriptRoot\generate_dummy_video.ps1" -OutputPath $TempVideo -Duration $Config.duration_seconds -Resolution $Config.resolution -BackgroundColor "black" -Text "AI topic: $Topic" -FontColor "white" -FontSize 48
        if ($AudioPath -and (Test-Path $AudioPath)) {
            Write-Log "Merging and looping audio with dummy video..."
            & $FFmpegPath -y -i $TempVideo -stream_loop -1 -i $AudioPath -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest $OutputPath
            Remove-Item $TempVideo
        } else {
            Move-Item -Path $TempVideo -Destination $OutputPath -Force
        }
    }
} else {
    Write-Log "=== Standard video generation ==="
    $ImageFolder = Resolve-Path $Config.image_folder -ErrorAction SilentlyContinue
    $AudioFile = if ($Config.audio_file) { Resolve-Path $Config.audio_file } else { $null }
    $OutputPath = [System.IO.Path]::GetFullPath($Config.output_path)
    if ($Config.image_folder -and (Test-Path $Config.image_folder) -and (Get-ChildItem $Config.image_folder -File).Count -gt 0) {
        Generate-Video -ImageFolder $ImageFolder -AudioFile $AudioFile -OutputPath $OutputPath -Resolution $Config.resolution -BitrateKbps $Config.bitrate_kbps -Framerate $Config.framerate -DurationSeconds $Config.duration_seconds
    } else {
        & "$PSScriptRoot\generate_dummy_video.ps1" -OutputPath $OutputPath -Duration $Config.duration_seconds -Resolution $Config.resolution -BackgroundColor "black" -Text "Auto-Generated Video" -FontColor "white" -FontSize 72
    }
}

# Upload video
$VideoId = Upload-Video -FilePath $OutputPath -Title $Config.video_title -Description $Config.video_description -Tags $Config.tags -PrivacyStatus $Config.privacyStatus -AccessToken $AccessToken

# Upload thumbnail if enabled
if ($Config.thumbnail_enabled) {
    $ThumbPath = Join-Path $PSScriptRoot "thumb.jpg"
    . "$PSScriptRoot\generate_thumbnail.ps1" -VideoPath $OutputPath -OutputPath $ThumbPath -Width 320 -Height 180
    Upload-Thumbnail -VideoId $VideoId -ThumbnailPath $ThumbPath -AccessToken $AccessToken
}

Write-Log "Video uploaded successfully! View at https://youtu.be/$VideoId"
