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
for cmd in curl tar mktemp; do
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
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/denev-install.XXXXXX")
ARCHIVE_PATH="${TMP_DIR}/archive"

curl -fsSL -L -o "$ARCHIVE_PATH" "$DOWNLOAD_URL" || die "Download failed"

ARCHIVE_NAME=$(echo "$DOWNLOAD_URL" | sed 's/.*\///')

# ── Verify checksum before touching anything ──────────────
SUMS_URL="${DOWNLOAD_URL%/*}/SHA256SUMS"
SUMS=$(curl -fsSL "$SUMS_URL") || die "Failed to download SHA256SUMS"

EXPECTED_HASH=$(printf '%s\n' "$SUMS" | grep " ${ARCHIVE_NAME}\$" | awk '{print $1}')
[ -z "$EXPECTED_HASH" ] && die "No checksum found for ${ARCHIVE_NAME} in SHA256SUMS"

if command -v sha256sum &>/dev/null; then
    ACTUAL_HASH=$(sha256sum "$ARCHIVE_PATH" | awk '{print $1}')
else
    ACTUAL_HASH=$(shasum -a 256 "$ARCHIVE_PATH" | awk '{print $1}')
fi

if [ "$ACTUAL_HASH" != "$EXPECTED_HASH" ]; then
    die "Checksum mismatch!
  Expected: $EXPECTED_HASH
  Actual:   $ACTUAL_HASH
The download may be corrupted or tampered. Nothing was installed."
fi

success "Checksum verified"

# ── Validate archive before extraction (allowlist) ─────────
# Only the binary and the lib are expected.

case "$ARCHIVE_NAME" in
    *.tar.gz)
        if tar -tvzf "$ARCHIVE_PATH" 2>/dev/null \
            | awk '{print $1, $NF}' \
            | grep -Ev '^-[rwx-]{9} (dnv|dnv\.exe|PCRE\.NET\.Native\.(so|dylib|dll))$'; then
            die "Archive contains unexpected files"
        fi
        count=$(tar -tzf "$ARCHIVE_PATH" 2>/dev/null | wc -l)
        [ "$count" -eq 2 ] || die "Archive does not contain the expected files"
        ;;
    *.zip)
        if unzip -Z1 "$ARCHIVE_PATH" 2>/dev/null \
            | grep -Ev '^(dnv|dnv\.exe|PCRE\.NET\.Native\.(so|dylib|dll))/?$'; then
            die "Archive contains unexpected files"
        fi
        count=$(unzip -Z1 "$ARCHIVE_PATH" 2>/dev/null | wc -l)
        [ "$count" -eq 2 ] || die "Archive does not contain the expected files"
        ;;
    *)
        die "Unknown archive format: ${ARCHIVE_NAME}"
        ;;
esac

# ── Extract ───────────────────────────────────────────────
info "Extracting..."

case "$ARCHIVE_NAME" in
    *.tar.gz|*.tgz)
        tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR" || die "Archive extraction failed"
        ;;
    *.zip)
        command -v unzip &>/dev/null || die "unzip is required to extract .zip archives"
        unzip -q "$ARCHIVE_PATH" -d "$TMP_DIR" || die "Archive extraction failed."
        ;;
esac

# ── Install ───────────────────────────────────────────────
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/denev"
BIN_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR" "$BIN_DIR"

rm -rf "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR" "$BIN_DIR"
cp -r "$TMP_DIR"/* "$INSTALL_DIR"/ || die "Failed to copy files to ${INSTALL_DIR}"
rm -rf "$ARCHIVE_PATH" 

# ── Binary + symlink (handles dnv and dnv.exe) ───────────────
BINARY_NAME="dnv"
if [ -f "$INSTALL_DIR/dnv.exe" ]; then
    BINARY_NAME="dnv.exe"
elif [ ! -f "$INSTALL_DIR/dnv" ]; then
    die "Binary 'dnv' not found in the archive"
fi

chmod +x "$INSTALL_DIR/$BINARY_NAME"
if [ "$OS" = "windows" ]; then
    cp -f "$INSTALL_DIR/$BINARY_NAME" "$BIN_DIR/$BINARY_NAME"
else
    ln -sf "$INSTALL_DIR/$BINARY_NAME" "$BIN_DIR/$BINARY_NAME"
fi

success "Installed to ${INSTALL_DIR}/${BINARY_NAME} (symlink in ${BIN_DIR}/${BINARY_NAME})"

# ── PATH setup ──────────────────────────────────────────
info "Configuring PATH..."
LINE='export PATH="$HOME/.local/bin:$PATH"'

# The installer runs through bash even when launched from zsh. Use the
# user's login shell so this works on macOS/zsh and Git Bash on Windows.
USER_SHELL="${SHELL:-}"
USER_SHELL="${USER_SHELL##*/}"
case "$USER_SHELL" in
    zsh)
        RC_FILE="$HOME/.zshrc"
        ;;
    bash)
        RC_FILE="$HOME/.bashrc"
        ;;
    *)
        # SHELL may be unset in some environments. The installer itself is
        # bash, so this is the most useful fallback for Git Bash.
        if [ -n "${BASH_VERSION:-}" ]; then
            USER_SHELL="bash"
            RC_FILE="$HOME/.bashrc"
        else
            RC_FILE="$HOME/.profile"
        fi
        ;;
esac

touch "$RC_FILE" || die "Cannot create shell configuration file: ${RC_FILE}"
[ -w "$RC_FILE" ] || die "Cannot write to shell configuration file: ${RC_FILE}"

# Persist the PATH independently from the current environment. The current
# shell may already contain ~/.local/bin temporarily, while a new shell still
# needs this line in its configuration file.
if grep -qsF "$LINE" "$RC_FILE"; then
    info "PATH entry already in ${RC_FILE}"
else
    printf '%s\n' "" "# Denev CLI" "$LINE" >> "$RC_FILE"
    info "Added PATH entry to ${RC_FILE}"
fi

if [[ ":$PATH:" == *":$HOME/.local/bin:"* ]]; then
    success "$HOME/.local/bin is already in the current PATH"
else
    # This affects only the installer subprocess; a child process cannot
    # modify the environment of the parent shell running `curl | bash`.
    export PATH="$HOME/.local/bin:$PATH"
    success "PATH configured in ${RC_FILE} and enabled for the installer"
fi

# ── Verify ──────────────────────────────────────────────
if command -v dnv &>/dev/null; then
    printf '\n  %s🎉 Denev CLI installed successfully!\n\n' "${GREEN}"
    dnv --help 2>/dev/null || true

    case "$USER_SHELL" in
        bash|zsh)
            if ! dnv completion "$USER_SHELL"; then
                info "Denev was installed, but auto-completion could not be configured for ${USER_SHELL}."
            fi
            ;;
        *)
            info "Auto-completion is not configured for shell: ${USER_SHELL}"
            ;;
    esac
    
    info "Restart your shell or run: source ${RC_FILE}"
else
    printf '\n  %s⚠️  Denev CLI installed, but not in current PATH.\n' "${YELLOW}"
    printf '  Restart your shell or run: source %s\n\n' "$RC_FILE"
fi