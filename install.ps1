# install.ps1 - zip only, Windows built-ins only

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$GREEN = [ConsoleColor]::Green
$YELLOW = [ConsoleColor]::Yellow
$RED = [ConsoleColor]::Red
$CYAN = [ConsoleColor]::Cyan
$GRAY = [ConsoleColor]::DarkGray

function info { param($msg); Write-Host "💡 $msg" -Fore $CYAN; Write-Host "" }
function success { param($msg); Write-Host "✅ $msg" -Fore $GREEN; Write-Host "" }
function die { param($msg); Write-Host "❌ $msg" -Fore $RED; Write-Host ""; exit 1 }

$script:tmpDir = $null
function cleanup {
    if ($script:tmpDir -and (Test-Path $script:tmpDir)) {
        Remove-Item -Recurse -Force -Path $script:tmpDir -ErrorAction SilentlyContinue
    }
}
trap { cleanup ; exit } 
[System.Console]::CancelKeyPress += { exit 2 }

# ── Detect OS / Arch ─────────────────────────────────────────
$OS = "windows"
$ARCH = "x86_64"

# ── Fetch release ────────────────────────────────────────────
$repo = "everwinner64/denev-cli"
$apiUrl = "https://api.github.com/repos/$repo/releases/latest"

info "Fetching latest release..."
try {
    $release = Invoke-RestMethod -Uri $apiUrl -Headers @{ Accept = "application/vnd.github.v3+json" }
}
catch { die "Failed to fetch release info from GitHub API." }

# ── Find .zip asset matching OS/Arch ─────────────────────────
$asset = $release.assets | Where-Object {
    $_.name -match '\.zip$' -and
    $_.browser_download_url -match $OS -and
    $_.browser_download_url -match $ARCH
} | Select-Object -First 1

if (-not $asset) {
    die "No .zip asset found for OS=$OS, Arch=$ARCH. Available: $($release.assets.name -join ', ')"
}

$downloadUrl = $asset.browser_download_url
$archiveName = $asset.name
info "Downloading: $archiveName"

# ── Temp dir ─────────────────────────────────────────────────
$script:tmpDir = Join-Path $env:TEMP ("denev-install-" + [Guid]::NewGuid().ToString("N")[0..7])
New-Item -ItemType Directory -Path $script:tmpDir | Out-Null
$archivePath = Join-Path $script:tmpDir $archiveName

# ── Download (Invoke-WebRequest = natif) ─────────────────────
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing
}
catch { die "Download failed: $_" }

# ── Extract (Expand-Archive = natif Windows) ─────────────────
Expand-Archive -Path $archivePath -DestinationPath $script:tmpDir -Force

# ── Install ──────────────────────────────────────────────────
$installDir = Join-Path $env:LOCALAPPDATA "denev\bin"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Get-ChildItem -Recurse -Path $script:tmpDir -File | ForEach-Object {
    $name = $_.Name
    # Copier dnv.exe et les éventuelles DLL natives (PCRE.NET.Native, etc.)
    if ($name -match '^dnv(\.exe)?$' -or $name -match '\.dll$') {
        Copy-Item -Path $_.FullName -Destination (Join-Path $installDir $name) -Force
    }
}

$binary = Get-ChildItem -Path $installDir -Filter "dnv*" | Select-Object -First 1
if (-not $binary) { die "Binary 'dnv' not found in archive" }

success "Installed to $installDir"

# ── PATH (user-level, persistant) ────────────────────────────
# On lit la valeur actuelle du PATH utilisateur seulement (pas le système)
$currentUserPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)

if ($currentUserPath -notlike "*$installDir*") {
    # Persister dans le registre (user-level, pas besoin d'admin)
    $newUserPath = "$installDir;$currentUserPath"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, [EnvironmentVariableTarget]::User)

    # Mettre à jour la session courante aussi
    $env:PATH = "$installDir;$env:PATH"

    success "Added $installDir to your user PATH (persistent)"
}
else {
    success "$installDir already in PATH"
}

# ── Verify ───────────────────────────────────────────────────
if (Get-Command dnv -ErrorAction SilentlyContinue) {
    Write-Host ""; Write-Host "  🎉 Denev CLI installed successfully!" -Fore $GREEN; Write-Host ""
    dnv --help 2>$null
}
else {
    Write-Host ""; Write-Host "  ⚠️  Installed but not in current PATH." -Fore $YELLOW
    Write-Host "  Restart PowerShell or run: . \$PROFILE" -Fore $GRAY; Write-Host ""
}