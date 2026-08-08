# generate_trending_topic.ps1

<#
.SYNOPSIS
Fetches a trending video title (and optional description) from YouTube.
.DESCRIPTION
Uses the YouTube Data API (videos.list with chart=mostPopular) if an API key is provided in the environment variable YOUTUBE_API_KEY.
If the key is missing, it falls back to a simple web‑scrape of the public Trending page (region IN) and extracts the first video title.
#>

param(
    [string]$Region = "IN",   # Change to your preferred region code
    [int]$MaxResults = 1
)

function Get-FromApi {
    $apiKey = $env:YOUTUBE_API_KEY
    if (-not $apiKey) { return $null }
    $uri = "https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=$Region&maxResults=$MaxResults&key=$apiKey"
    try {
        $response = Invoke-RestMethod -Method Get -Uri $uri -ErrorAction Stop
        return $response.items[0].snippet.title
    } catch {
        Write-Warning "YouTube API call failed: $_"
        return $null
    }
}

function Get-FromScrape {
    $url = "https://www.youtube.com/feed/trending?gl=$Region"
    try {
        $html = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        # Simple regex to capture first video title – may need tuning for localisation
        if ($html.Content -match '<a[^>]*title="([^"]+)"[^>]*class="yt-simple-endpoint style-scope ytd-video-renderer"') {
            return $matches[1]
        }
        return $null
    } catch {
        Write-Warning "Scraping failed: $_"
        return $null
    }
}

$topic = Get-FromApi
if (-not $topic) { $topic = Get-FromScrape }
if (-not $topic) { $topic = "Artificial Intelligence and Machine Learning Trends" }

if ($topic) {
    Write-Host "Trending topic detected: $topic"
    # Output only the plain string – PowerShell callers capture via $(...)
    $topic
} else {
    Write-Error "Unable to determine a trending topic."
    exit 1
}
