<div align="center">

<a href="https://denev.pages.dev/">
    <picture>
        <source srcset="/images/readme/logo-large.svg" media="(prefers-color-scheme: dark)">
        <img src="/images/readme/logo-large-light.svg" alt="denev"/>
    </picture>
</a>

![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-5f86f2?style=for-the-badge&logo=shell&labelColor=040C25&logoColor=white)
![GitHub Release](https://img.shields.io/github/v/release/everwinner64/denev-cli?style=for-the-badge&logo=github&labelColor=040C25&color=5f86f2&logoColor=white)
[![Docs](https://img.shields.io/badge/docs-latest-5f86f2?style=for-the-badge&logo=readthedocs&labelColor=040C25&logoColor=white)](https://denev.pages.dev/docs/latest/)
[![License](https://img.shields.io/badge/license-Custom-5f86f2?style=for-the-badge&logo=readme&labelColor=040C25&logoColor=white)](#license)
[![Support](https://img.shields.io/badge/support-Ko--fi-5f86f2?style=for-the-badge&logo=kofi&labelColor=040C25&logoColor=white)](https://ko-fi.com/everwinner64)

## One CLI. Everyday developer utilities.

</div>

Denev started with a simple observation.

As developers, we constantly leave our terminal for utility tasks.

A UUID.
A SHA256 hash.
A decoded JWT.
A converted timestamp.
A certificate inspection.
A regex test.
Some random data.
A quick HTTP timing check.

None of these tasks are difficult.

They're just interruptions.

Each interruption breaks your flow. You search your shell history, open a browser, install another tiny utility, copy data between websites, then finally get back to what you were actually doing.

**Denev exists to keep you in the terminal.** 

Every command is designed to feel natural, every output is designed to be readable, and every feature remains scriptable. Humans first. Machines included.

Instead of dozens of small tools, websites, and one-off scripts, Denev brings the utilities developers reach for every day into one consistent command-line experience.

Hashes, JWTs, Base64, regex, UUIDs, certificates, random data, time, HTTP, URLs, JSON, project statistics... they're all available behind the same interface.

---

## How it works

```bash
dnv crypto hash "hello world"
dnv jwt inspect <token>
dnv regex test "/\d+/" "abc123"
dnv url inspect "https://example.com:8443/path?q=hello"
dnv http timing example.com
dnv stats ./src
```

Everything follows the same pattern:

```text
dnv <domain> <action> [arguments]
```

Provide input through arguments or stdin.
Readable output by default.
Machine-friendly output with `--quiet`.

---

## What's inside

Denev brings together the developer utilities you reach for every day:

- 🔐 **Crypto**: hashes, HMACs...
- 🎫 **JWT**: inspect and generate tokens
- 🆔 **UUID**: generate, validate and inspect
- 📜 **Certificates**: create and inspect X.509/TLS certificates
- 🧪 **Regex**: test, debug and visualize patterns
- 🌐 **HTTP & URLs**: inspect requests, responses and timings
- 🕒 **Time**: timestamps, durations and timezones
- 🎲 **Random**: passwords, strings, bytes and numbers
- 📄 **JSON**: query, transform and compare documents
- 📊 **Project stats**: languages, files and lines of code
- **...and more.**

---

## Design Principles

### One mental model

Learn one command structure and use it everywhere.

Once you know:

```bash
dnv crypto hash
```

you already understand:

```bash
dnv jwt inspect
dnv url encode
dnv time convert
```

No special syntax to memorize.

### Human-friendly. Automation-ready.

Output is colorful and easy to read in a terminal.

Need automation?

Add `--quiet` to produce clean JSON or raw values for scripts, CI pipelines, and shell composition.

### Good defaults

The common case should be the easiest case.

- `dnv crypto hash` => SHA256
- `dnv uuid generate` => UUID v4
- `dnv stats` => current directory

### Guardrails, not roadblocks

Unsafe choices aren't forbidden, they're explained.

- MD5 and SHA1 produce warnings.
- Unsigned JWTs are highlighted.
- Potential ReDoS patterns are detected.

If you know what you're doing, `--no-confirm` lets you proceed.

---

## Install

```bash
# Linux, macOS, and Windows (Git Bash, WSL)
curl -fsSL https://denev.pages.dev/install.sh | bash

# Windows x86_64 (PowerShell 5.1+)
irm https://denev.pages.dev/install.ps1 | iex
```

Manual download, it's [here](https://denev.pages.dev/download/#manual-install)!

---

## Documentation

Looking for every command and option?

https://denev.pages.dev/docs/latest/

---

## License

The Denev CLI is licensed under the custom license described in [CLI-LICENSE.txt](./CLI-LICENSE.txt).

The Denev CLI website (this repository) and its documentation are licensed under a MIT-Based License with Attribution Requirement. See [LICENSE.md](./LICENSE.md).