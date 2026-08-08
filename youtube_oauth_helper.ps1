# youtube_oauth_helper.ps1

<#
.SYNOPSIS
Performs OAuth 2.0 consent flow for YouTube Data API and stores refresh token in the provided config file.
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ConfigPath
)

# Load existing config (or create empty object)
if (Test-Path $ConfigPath) {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
} else {
    $Config = @{}
}

if (-not $Config.client_id -or -not $Config.client_secret) {
    Write-Error "client_id and client_secret must be set in $ConfigPath before running OAuth flow."
    exit 1
}

$ClientId = $Config.client_id
$ClientSecret = $Config.client_secret
$RedirectUri = "urn:ietf:wg:oauth:2.0:oob"
$Scope = "https://www.googleapis.com/auth/youtube.upload"

$AuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=$ClientId&redirect_uri=$RedirectUri&response_type=code&scope=$([uri]::EscapeDataString($Scope))&access_type=offline&prompt=consent"

Write-Host "Opening browser for OAuth consent..."
Start-Process $AuthUrl

$AuthCode = Read-Host "Enter the authorization code you received after granting permission"

$TokenUri = "https://oauth2.googleapis.com/token"
$Body = [ordered]@{
    code = $AuthCode
    client_id = $ClientId
    client_secret = $ClientSecret
    redirect_uri = $RedirectUri
    grant_type = "authorization_code"
}

try {
    $TokenResponse = Invoke-RestMethod -Method Post -Uri $TokenUri -ContentType "application/x-www-form-urlencoded" -Body $Body
    $Config.refresh_token = $TokenResponse.refresh_token
    $Config.access_token = $TokenResponse.access_token
    $Config.token_expiry = (Get-Date).AddSeconds($TokenResponse.expires_in)
    $Config | ConvertTo-Json -Depth 5 | Set-Content -Path $ConfigPath -Encoding UTF8
    Write-Host "Refresh token saved to $ConfigPath."
} catch {
    Write-Error "Failed to obtain tokens: $_"
    exit 1
}
