# install_python_deps.ps1

<#
.SYNOPSIS
Installs a Python virtual environment with required AI/ML packages (diffusers, torch, transformers, accelerate).
.DESCRIPTION
If Python is not found, prompts the user to install it manually.
Creates a `venv` folder inside the project root and installs the packages via pip.
#>

param(
    [string]$ProjectRoot = $PSScriptRoot
)

# Check if python is available
try {
    $pythonVersion = python --version 2>$null
} catch {
    Write-Warning "Python is not installed or not in PATH. Please install Python 3.9+ and rerun this script."
    exit 1
}

$venvPath = Join-Path $ProjectRoot "venv"
if (-Not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment at $venvPath..."
    python -m venv $venvPath
}

$pipPath = Join-Path $venvPath "Scripts\pip.exe"
if (-Not (Test-Path $pipPath)) {
    Write-Error "pip not found in virtual environment."
    exit 1
}

# Upgrade pip
& $pipPath install --upgrade pip

# Install required packages
$requirements = @(
    "torch",          # CPU version; GPU if available via torch's wheels
    "diffusers",
    "transformers",
    "accelerate",
    "gtts"            # optional TTS library
)

Write-Host "Installing Python packages..."
& $pipPath install $requirements

Write-Host "Python dependencies installed successfully."
