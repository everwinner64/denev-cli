#!/usr/bin/env bash

set -euo pipefail

# ── Colors ──────────────────────────────────────────────
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m' # Reset

# ── Helpers ─────────────────────────────────────────────
info()  { printf '%s\n\n' "💡 ${BLUE}${*}${NC}"; }
success() { printf '%s\n\n' "✅ ${GREEN}${*}${NC}"; }
die()   { printf '%s\n\n' "❌ ${RED}${*}${NC}" >&2; exit 1; }

# ── Cleanup trap ────────────────────────────────────────
TMP_DIR=""
cleanup() {
    if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
        rm -rf "$TMP_DIR"
    fi
}
trap cleanup EXIT
trap 'exit 2' INT TERM

# ── Dependency check ────────────────────────────────────
for cmd in curl tar mktemp install; do
    command -v "$cmd" &>/dev/null || die "Required command not found: ${cmd}"
done

# ── OS detection ────────────────────────────────────────
info "Detecting system..."
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m | tr '[:upper:]' '[:lower:]')

case "$OS" in
    linux)
        OS="linux"
        ;;
    darwin)
        OS="macos"
        ;;
    mingw*|msys*|cygwin*)
        OS="windows"
        ;;
    *)
        die "Unsupported operating system: ${OS}"
esac

case "$ARCH" in
    x86_64|amd64)
        ARCH="x86_64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        ;;
    *)
        die "Unsupported architecture: ${ARCH}"
esac

# ── Fetch release ───────────────────────────────────────
info "Fetching latest release (${OS}-${ARCH})..."

RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/everwinner64/denev-cli/releases/latest") \
    || die "Failed to fetch latest release info"

# Extract all browser_download_url values, then pick the one matching our OS/ARCH
DOWNLOAD_URL=$(echo "$RELEASE_JSON" \
    | grep -o '"browser_download_url": *"[^"]*"' \
    | sed 's/"browser_download_url": *"//;s/"$//' \
    | while IFS= read -r url; do
        url_lower=$(echo "$url" | tr '[:upper:]' '[:lower:]')
        if echo "$url_lower" | grep -q "$OS" && echo "$url_lower" | grep -q "$ARCH"; then
            echo "$url"
            break
        fi
      done)

[ -z "$DOWNLOAD_URL" ] && die "No release asset found for ${OS}/${ARCH}"

# ── Download ─────────────────────────────────────────────
info "Downloading archive..."
TMP_DIR=$(mktemp -d denev-install.XXXXXXXXXX)
ARCHIVE_PATH="${TMP_DIR}/archive"

curl -fsSL -L -o "$ARCHIVE_PATH" "$DOWNLOAD_URL" || die "Download failed"

# ── Extract ───────────────────────────────────────────────
info "Extracting..."
ARCHIVE_NAME=$(echo "$DOWNLOAD_URL" | sed 's/.*\///')

case "$ARCHIVE_NAME" in
    *.tar.gz|*.tgz)
        tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR" || die "Archive extraction failed"
        ;;
    *.zip)
        command -v unzip &>/dev/null || die "unzip is required to extract .zip archives"
        unzip -q "$ARCHIVE_PATH" -d "$TMP_DIR" || die "Archive extraction failed"
        ;;
    *)
        die "Unknown archive format: ${ARCHIVE_NAME}"
        ;;
esac

# ── Install ───────────────────────────────────────────────
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/denev"
BIN_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR" "$BIN_DIR"

# ── Copier dans le dossier dédié ──────────────────────────
rm -rf "$ARCHIVE_PATH" 
cp -r "$TMP_DIR"/* "$INSTALL_DIR"/ || die "Failed to copy files to ${INSTALL_DIR}"

# Ensure the main binary is executable
if [ -f "$INSTALL_DIR/dnv" ]; then
    chmod +x "$INSTALL_DIR/dnv"
elif [ -f "$INSTALL_DIR/dnv.exe" ]; then
    chmod +x "$INSTALL_DIR/dnv.exe"
else
    die "Binary 'dnv' not found in the archive"
fi

# ── Symlink dans ~/.local/bin/ ────────────────────────────
ln -sf "$INSTALL_DIR/dnv" "${BIN_DIR}/dnv"

success "Installed to ${INSTALL_DIR}/dnv (symlink in ${BIN_DIR}/dnv)"

# ── PATH setup ──────────────────────────────────────────
info "Configuring PATH..."
LINE='export PATH="$HOME/.local/bin:$PATH"'

if [[ ":$PATH:" == *":$HOME/.local/bin:"* ]]; then
    success "$HOME/.local/bin is already in PATH"
else
    for rc in ~/.bashrc ~/.zshrc ~/.zprofile; do
        [ -f "$rc" ] || continue           # skip if file doesn't exist
        [ -w "$rc" ] || { info "Cannot write to ${rc}, skipping."; continue; }

        grep -qsF "$LINE" "$rc" && { info "PATH entry already in $(basename "$rc")"; continue; }

        printf '%s\n' "" "# Denev CLI" "$LINE" >> "$rc"
        info "Added PATH entry to $(basename "$rc")"
    done
    export PATH="$HOME/.local/bin:$PATH"
    success "PATH updated for current session"
fi

# ── Verify ──────────────────────────────────────────────
if command -v dnv &>/dev/null; then
    printf '\n  %s🎉 Denev CLI installed successfully!\n\n' "${GREEN}"
    dnv --help 2>/dev/null || printf '  Run "dnv --help" to get started.\n'
else
    printf '\n  %s⚠️  Denev CLI installed, but not in current PATH.\n' "${YELLOW}"
    printf '  You should restart your shell\n\n'
fi