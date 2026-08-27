# Denev CLI {#introduction}

Denev (a portmanteau of Deneb, a star, and "dev" for developer) is a cross-platform command-line toolkit that brings together the kinds of utilities developers reach for every day. Instead of switching between operating-system-specific commands, standalone utilities, online tools, and one-off scripts, Denev provides a single, consistent interface for recurring development tasks.

Whether you need to inspect JSON, generate UUIDs or random values, compute hashes, inspect certificates or JWTs, diagnose HTTP endpoints, or manipulate URLs and timestamps, the commands follow the same conventions across Windows, Linux, and macOS. The executable is named `dnv`.

### A consistent way to solve everyday problems {#philosophy-part1}

Denev is built around a simple idea: developer utilities should not interrupt your workflow.

Many everyday tasks are individually simple, but they often require switching tools, remembering different command syntaxes, or leaving the terminal entirely. One task uses a tool, another relies on a browser-based JWT decoder, another requires a platform-specific utility, and yet another depends on a small script you wrote months ago.

Denev focuses on the common operations developers perform repeatedly and gives them a unified interface. Once you become familiar with one command, the others should feel immediately recognizable.

The goal is to provide one coherent command-line experience.

### Design philosophy {#philosophy-part2}

Every command in Denev follows the same design principles.

**Consistency first.** Most commands share the same structure, option naming, exit codes, and output conventions whenever possible.

**Human-friendly by default.** Output is designed to be easy to read by humans.

**Automation-ready.** When you need to script or integrate Denev into CI pipelines, commands expose machine-friendly output through options such as `--quiet`.

**Good defaults.** The most common operation should require the fewest arguments while still remaining explicit when needed.

**Guardrails instead of restrictions.** Potentially unsafe operations are explained with warnings rather than unnecessarily prohibited, leaving the final decision to the user.

These principles apply consistently throughout the CLI so that learning one module makes the next one feel familiar.

### About this documentation {#about-doc}

This documentation follows the same philosophy as the CLI itself. Every command is documented using the same structure:

a short description explaining its purpose;
the command syntax;
available arguments and options;
practical examples;
notes, tips, and warnings where appropriate.

Shared concepts, such as standard input, quiet output, file handling, and exit codes, are explained once before the module reference to avoid repeating the same information throughout the documentation.

## Installation {#install}

Denev is designed to run on Windows 10 and 11, Linux (x86_64 and arm64), and macOS (both Intel and Apple Silicon). You can download Denev directly from the [download page](/download/#manual-install){target="_blank" rel="noopener noreferrer"}, or, even easier, use one of the following methods:

Linux, macOS, and Windows (Git Bash, WSL)

```bash
curl -fsSL https://denev.pages.dev/install.sh | bash
```

Windows x86_64 (PowerShell 5.1+)

```powershell
irm https://denev.pages.dev/install.ps1 | iex
```

Once `dnv` is installed, verify that it is on your `PATH`:

```bash
dnv --version
dnv --help
```

>![tip](/images/icons/tip.svg) Tip: If you didn't used one of the install script, or if PATH update failed during install, run `dnv completion <yourShellName>` to enable auto-completion. Bash, Zsh, and PowerShell 5.1+ are supported.
{.tip}

### Updating {#updating}

Denev includes a self-update command. When you need to get the latest version, you can run the following command:

```bash
dnv update
```

> ![tip](/images/icons/tip.svg) Tip: The update command accepts options — see the [update section](#update) for details.
{.tip}

### Uninstalling {#uninstall}

To uninstall Denev, you can run the following commands:

Linux:

```bash
rm -f ~/.local/bin/dnv && rm -rf ~/.local/share/denev && rm -rf ~/.cache/denev-cli && rm -rf ~/.local/share/denev-cli && rm -rf ~/.config/denev-cli
```

macOS:

```bash
rm -f ~/.local/bin/dnv && rm -rf ~/.local/share/denev && rm -rf ~/Library/Caches/denev-cli && rm -rf ~/Library/Application\ Support/denev-cli && rm -rf ~/.config/denev-cli

```

Windows (PowerShell):
```powershell
Remove-Item "$env:LOCALAPPDATA\denev" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\denev-cli" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\.config\denev-cli" -Recurse -Force -ErrorAction SilentlyContinue
```

After running the commands for your OS, you may need to remove Denev from your shell config (~/.bashrc, ~/.zshrc, ~/.profile, etc.).

> ![note](/images/icons/note.svg) Note: Changes will be fully applied after starting a new terminal.

> ![warning](/images/icons/warning.svg) Warning: On Linux and macOS, paths depend on `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, and `XDG_CACHE_HOME` when set. Check the actual locations with `echo "$XDG_CONFIG_HOME"` etc. before running the commands above.
{.warning}
## Getting started {#get-started}

Denev mostly follows this shape:

```bash
dnv <module> <command> [arguments] [options]
```

> ![note](/images/icons/note.svg) Note: Some commands such as `stats`, `update`, or `license` use `dnv <command> [arguments] [options]` shape.

Start with a small inspection or conversion first, so you can get a feel for the syntax without worrying about side effects — none of these examples modify their inputs:

```bash
dnv uuid generate --type V7
dnv url inspect "https://example.com:8443/search?q=denev#docs"
dnv json get user::name '{"user":{"name":"Ari"}}'
dnv http status 429
```

When you script or automate tasks, pipe data through standard input whenever a command lets you omit the positional argument — that way you avoid temporary files — and pair it with quiet mode for machine-readable output:

```bash
printf '%s' '{"build":{"version":"1.0.0"}}' | dnv json get build::version -q
printf '%s' 'hello world' | dnv base64 encode -q
```

### A typical workflow {#typical-workflow}

1. Start by inspecting or validating a value — `url inspect`, `uuid validate`, `jwt inspect`, and `json get` are good entry points because they are read-only and let you verify your data first.
2. Reach for `--quiet` only when the command explicitly documents a machine-readable or raw output mode; otherwise the output may be formatted for a terminal and harder to parse.
3. Use `-o, --output` where the command supports it. Each command validates the extension you supply, so you will get a clear error if the format is not accepted.
4. Check the exit code in your scripts: 0 means success, any other value tells you what went wrong (the table in Concepts below gives the full list).

## Concepts and conventions {#concepts-conventions}

### Input {#concepts-conventions-input}

Many commands accept a positional value directly, but when you omit it they read from standard input instead — which means you can pipe data without creating a temporary file. Some commands use `--file` to treat that positional value as a file or directory path, so check each command's card before assuming both forms work: not every command supports both.

> ![note](/images/icons/note.svg) Note: When a command accepts several positional values and supports piping, piped input always occupies the last position.

### Output, files, and clipboard {#concepts-conventions-output}

Normal output is formatted for a terminal so you can read it at a glance, but that is not always what you want in a script. `--quiet` strips prompts and formatting, though what you get back — raw text, JSON, or simply an exit code — depends on the command, so check the command card rather than assuming. `-c, --copy` places a result on your clipboard wherever the command supports it. Copying requires exactly one result, so `--copy` cannot be combined with `--quiet` or multi-value output such as `--repeat`; individual cards only repeat this rule when a command-specific nuance exists.

Diagnostics never pollute your data: warnings and errors are written to stderr, so stdout carries only the command's output — even when piped. `--quiet` strips formatting and prompts from stdout but never hides warnings since they are on stderr.

When a command writes a file, it infers the format from the extension you provide. If the file already exists, you are asked for confirmation unless you pass `--force`; if you decline, the command exits with code 4. When piping input, `--force` is required to overwrite an existing file because there is no terminal to prompt.

### Exit codes {#exit-codes}

| Code | Meaning |
| --- | --- |
| 0 | Success |
| 1 | Generic error or a command-specific negative result |
| 2 | Invalid input, incompatible options, or parsing errors |
| 3 | Timeout |
| 4 | User declined a confirmation |
| 5 | File I/O error |
| 6 | Network error |

## Modules {#modules}

| Module | Use it for |
| --- | --- |
| `update` | CLI self-update |
| `stats` | Source-file language statistics |
| `crypto` | Hashes and HMACs |
| `jwt` | Generating and inspecting JWTs |
| `base64` / `b64` | Base64 encoding and decoding |
| `regex` | Testing, explaining, and saving regular expressions |
| `uuid` | Generating, inspecting, and validating UUIDs |
| `cert` | Generating and inspecting TLS certificates |
| `random` | Strings, integers, bytes, passwords, and picks |
| `time` | Converting, comparing, and adding time values |
| `http` | Status codes, headers, and response timing |
| `url` | URL inspection, encoding, and decoding |
| `json` | JSON extraction, filtering, and semantic diffs |

## Command documentation {#command-doc}

Every command card below follows the same reading order — description, syntax, arguments and options, then examples and notes — so once you have read one, you can find your way around any of them. Aliases invoke the same implementation, which means `dnv cert gen` behaves exactly like `dnv cert generate`.

### `dnv update` {#update}

#### Description {.desc}

Autonomously updates the CLI to the latest version or the targeted one.

#### Syntax {.syntax}

```bash
dnv update [options]
```

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `--target` | Version to target using x.y.z format |
| `--force` | Skip all confirmation prompts |

#### Examples and notes {.examples}

Use it to easily get up to date; the first example below updates the CLI to the latest version, while the second is targeting a specific version:

```bash
dnv update
dnv update --target 1.2.0
```

> ![note](/images/icons/note.svg) Note: If no specific target is given, the latest update will be downloaded.

> ![warning](/images/icons/warning.svg) Warning: When using `--target` to access an older version, note that only the four most recent documentation versions are available. Versions containing only bug fixes are not counted. Example: if the latest release is v2.0.3, the available documentation versions would be the latest patch release of each of the four most recent minor versions — v2.0.3, v1.9.8, v1.8.12, and v1.7.15 (assuming these versions exist).
{.warning}

### `dnv stats` {#stats}

#### Description {.desc}

Analyzes a file or directory and produces language statistics, which is useful when you want a quick inventory of a codebase. If you do not supply a path, it analyzes the current directory by default.

> ![warning](/images/icons/warning.svg) Warning: All path arguments are resolved relative to the current working directory.
{.warning}

#### Syntax {.syntax}

```bash
dnv stats [path] [options]
```

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[path]` | File or directory; current directory by default |
| `-t, --top <n>` | Keep the top N languages by line count |
| `-m, --min-lines <n>` | Exclude files with fewer than N lines |
| `--nv, --no-void` | Exclude empty lines from counts |
| `--no-comments` | Exclude comment lines from counts |
| `-e, --exclude <path>` | Comma-separated paths or extensions to exclude |
| `-d, --default-exclude` | Exclude `.git`, `bin`, `obj`, `node_modules`, `dist`, and `coverage` |
| `-n, --name [n]` | Show per-file details, optionally limited to N files per language |
| `-o, --output <path>` | `.json`, `.csv`, `.md`, or `.table`; defaults to `.json` when extensionless |
| `-q, --quiet` | Plain JSON to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

Use it to get a quick project inventory; the first example below limits output to the top 8 languages and skips common generated folders, while the second exports to CSV for sharing:

```bash
dnv stats ./src --default-exclude --top 8
dnv stats . --no-comments -o statistics.csv
```

> ![tip](/images/icons/tip.svg) Tip: You should exclude generated folders explicitly if they matter to your repository, otherwise they may inflate the counts. A nonexistent positional path is a file I/O error (exit code 5), but an exclusion entry that matches nothing simply produces a warning on stderr — the command still succeeds.
{.tip}

> ![note](/images/icons/note.svg) Note: Supported extensions are `.cs`, `.js`, `.ts`, `.jsx`, `.tsx`, `.html`, `.css`, `.scss`, `.sass`, `.py`, `.java`, `.kt`, `.kts`, `.c`, `.cpp`, `.go`, `.rs`, `.php`, `.rb`, `.swift`, `.dart`, `.lua`, `.sh`, `.ps1`, `.sql`, `.json`, `.jsonc`, `.xml`, `.yml`, `.yaml`, `.fs`, `.r`, and `.scala`. Any extensions not mentioned here are neither analyzed nor counted.

### `dnv crypto` {#crypto}

Use the crypto module whenever you need a digest or a keyed digest — from text, standard input, a file, or an entire directory — because it centralises what would otherwise require several different OS tools.

#### `dnv crypto hash` {#crypto-hash}

#### Description {.desc}

Creates a cryptographic hash of your input. SHA-256 is the default because it strikes a good balance between speed and security, but you can choose SHA-1 or MD5 too — the command will warn you, though, since neither is considered cryptographically safe for modern use.

#### Syntax {.syntax}

`dnv crypto hash [input] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[input]` | Text, stdin when omitted, or file/directory paths with `--file` |
| `-f, --file` | Treat input as comma-separated file or directory paths |
| `-a, --algo <algo>` | `SHA256`, `SHA384`, `SHA512`, `SHA1`, `SHA3_256`, `SHA3_384`, `SHA3_512`, or `MD5` |
| `-e, --exclude <path>` | Exclusions in file mode |
| `--check <hash>` | Compare the calculated digest with a supplied hash |
| `--nw, --no-warn` | Bypass warnings for weak algorithms |
| `-c, --copy` | Copy one result |
| `-q, --quiet` | Raw hash output |

#### Examples and notes {.examples}

Hash text or a file, then use `--check` where a single input is applicable:

```bash
dnv crypto hash 'release-candidate'
dnv crypto hash ./artifact.zip --file --algo SHA512
dnv crypto hash 'hello' --check 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824 -q
```

> ![warning](/images/icons/warning.svg) Warning: Prefer SHA-256 or stronger. `--check` cannot be used with `--copy` and is restricted to a single input.
{.warning}

#### `dnv crypto hmac` {#crypto-hmac}

#### Description {.desc}

Computes an HMAC for your text or files using a key that you supply directly or that the command prompts you for — which is useful when you need to verify message authenticity without exposing the key in your command history.

#### Syntax {.syntax}

`dnv crypto hmac [input] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[input]` | Text, stdin when omitted, or file/directory paths with `--file` |
| `-k, --key` | Prompt for a hidden HMAC key |
| `--key-env <var>` | Read the key from an environment variable |
| `-f, --file` | Treat input as comma-separated file or directory paths |
`-e, --exclude <path>` | Exclusions in file mode |
| `-a, --algo <algo>` | Hash algorithm for the HMAC |
| `--check <hmac>` | Compare an HMAC |
| `--nw, --no-warn` | Bypass weak-algorithm warnings |
| `-c, --copy`, `-q, --quiet` | Copy one result / raw output |

#### Examples and notes {.examples}

Use an environment variable in non-interactive automation:

```bash
dnv crypto hmac 'payload' --key-env API_HMAC_KEY --algo SHA512
dnv crypto hmac ./payload.json --file --key-env API_HMAC_KEY -q
```

> ![warning](/images/icons/warning.svg) Warning: As with `crypto hash`, copy and check modes are restricted to a single input.
{.warning}

### `dnv jwt` {#jwt}

The JWT module lets you create signed tokens and also decode or optionally verify them, so you can both generate and inspect tokens without switching between separate tools.

#### `dnv jwt generate` (alias: `dnv jwt gen`) {#jwt-generate}

#### Description {.desc}

Generates signed JWTs that include whatever JSON claims you need plus standard registered claims — useful when you are testing authentication or need to issue tokens in a script.

#### Syntax {.syntax}

`dnv jwt generate [claims] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[claims]` | JSON object of custom claims; stdin when omitted |
| `-a, --algorithm <alg>` | Signing algorithm |
| `--secret` | Prompt for a symmetric secret |
| `--secret-env <var>` | Read it from an environment variable |
| `--skf, --secret-key-file <pem>` | PEM private key for RS/PS/ES signing |
| `--skpe, --secret-key-pw-env <var>` | Password environment variable for that private key |
| `--exp, --expires-in <duration>` | Expiration duration |
| `--nbf, --not-before <duration>` | Not-before duration |
| `--iss` | Token's issuer |
| `--sub` | Token's subject |
| `--aud` | Token's audience |
| `--jti` | Add a JWT ID |
| `-r, --repeat <n>` | Generate N tokens |
| `-c, --copy` | Copy one token |
| `-o, --output <path>` | `.json` or `.txt`; defaults to `.json` |
| `-q, --quiet` | JSON output to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

Create a short-lived HMAC token:

```bash
dnv jwt generate '{"role":"reader"}' --secret-env JWT_SECRET --iss api --exp 30m
dnv jwt gen '{"role":"user"}' --secret-env JWT_SECRET --sub user-42 --aud dashboard -q
```

> ![warning](/images/icons/warning.svg) Warning: Use environment variables for non-interactive secrets. A missing or empty variable, invalid duration, unsupported algorithm, or incompatible signing inputs is an input error (2).
{.warning}

> ![tip](/images/icons/tip.svg) Tip: Claims can contain placeholders. Available placeholders are {{n}}, {{uuid}}, {{timestamp}}, and {{rand}}. {{n}} represents the current iteration number. {{uuid}} generate a new random at every iteration. {{timestamp}} uses the UTC Unix timestamp. {{rand}} uses a cryptographically secure 4 bytes string.
{.tip}

#### `dnv jwt inspect` {#jwt-inspect}

#### Description {.desc}

Decodes a JWT so you can examine its header and payload, and can optionally verify it with a symmetric secret or public key to confirm the token has not been tampered with.

#### Syntax {.syntax}

`dnv jwt inspect [token] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[token]` | JWT, or stdin when omitted |
| `--secret` | Prompt for a symmetric |
| `--secret-env <var>` | Load a verification secret |
| `--pk, --public-key <pem>` | Public key for RS/PS/ES verification |
| `-a, --algorithm <alg>` | Verification algorithm |
| `--pretty [path]` | Display formatted JSON and optionally save it as JSON |
| `-q, --quiet` | JSON stdout only |

#### Examples and notes {.examples}

```bash
dnv jwt inspect "$TOKEN"
dnv jwt inspect "$TOKEN" --secret-env JWT_SECRET --algorithm HS256
```

> ![note](/images/icons/note.svg) Note: When you inspect a token without supplying a verification key, the command decodes it so you can see the contents, but that alone does not establish trust — anyone could have created it. If the token is malformed, you get an input error (exit code 2); if verification fails because the signature does not match, you get exit code 1.

### `dnv base64` (alias module: `dnv b64`) {#base64}

Use `base64` whenever you need to convert text or raw file contents to or from Base64, and since typing `base64` every time can feel long, the shorter alias `b64` exposes the same `encode`/`enc` and `decode`/`dec` commands.

#### `dnv base64 encode` (aliases: `enc`, `b64 encode`, `b64 enc`) {#base64-encode}

#### Description {.desc}

Encodes your text, stdin, or file or directory contents as classic Base64 or Base64URL — the `--url` flag lets you switch to the URL-safe variant, which is useful when you need to include the output in a URL or query parameter without worrying about `+` and `/` characters.

#### Syntax {.syntax}

`dnv base64 encode [input] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[input]` | Plain text or file path, or stdin when omitted |
| `-f, --file` | Treat input as comma-separated file/directory paths |
| `-u, --url` | Use Base64URL |
| `-e, --exclude <path>` | Exclusions in file mode |
| `-c, --copy` | Copy a single result |
| `-o, --output <path>` | `.b64`, `.hex`, `.bin`, or `.json`; extensionless output becomes `.bin` |
| `-q, --quiet` | Raw output |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv base64 encode 'Hello world' -q
dnv b64 enc ./avatar.png --file -o avatar.b64
```

> ![note](/images/icons/note.svg) Note: `--copy` cannot be used for a folder or multiple paths.

#### `dnv base64 decode` (aliases: `dec`, `b64 decode`, `b64 dec`) {#base64-decode}

#### Description {.desc}

Decodes classic Base64 or Base64URL input back into text or bytes, which is the counterpart to `encode` and supports the same options so you can round-trip data without surprises.

#### Syntax {.syntax}

`dnv base64 decode [input] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[input]` | Plain text, or a file path whose contents are Base64 encoded; stdin when omitted |
| `-f, --file` | Treat input as comma-separated file/directory paths |
| `-u, --url` | Use Base64URL |
| `-e, --exclude <path>` | Exclusions in file mode |
| `-c, --copy` | Copy a single result |
| `-o, --output <path>` | `.b64`, `.hex`, `.bin`, or `.json`; extensionless output becomes `.bin` |
| `-q, --quiet` | Raw output |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv base64 decode SGVsbG8gd29ybGQ= -q
dnv base64 dec 'aGVsbG8=' -u -o decoded.bin
```

> ![warning](/images/icons/warning.svg) Warning: Apply `--url` only when your input is Base64URL-encoded, because what works for one encoding will not produce the correct output for the other.
{.warning}


### `dnv regex` {#regex}

The regex module lets you test patterns, visualize their syntax tree, and manage named patterns you want to reuse — so instead of remembering which online tool you used last time, you have everything locally and offline.

#### `dnv regex test` {#regex-test}

#### Description {.desc}

Tests a regex pattern against input and reports matches, including support for the convenient `/pattern/flags` notation. It also performs compatibility and ReDoS-oriented analysis, which helps you catch performance issues or cross-engine incompatibilities before you deploy the pattern.

#### Syntax {.syntax}

`dnv regex test <pattern> [input] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<pattern>` | Required regex pattern |
| `[input]` | Text, or stdin line-by-line when omitted |
| `-p, --portable` | Highlight cross-engine compatibility issues |
| `--engine <engine>` | `dotnet`, `ECMAScript`, `Python`, `Pcre2`, or `JavaPattern` |
| `--options <options>` | Options for patterns not using slash flags |
| `--timeout <ms>` | Execution timeout; default 2000 ms |
| `--all` | Show every match |
| `-q, --quiet` | No output; 0 for match, 1 for no match |

#### Examples and notes {.examples}

```bash
dnv regex test '/\\d+/' 'order-42'
printf 'cat\ndog\n' | dnv regex test '/^d/' --all
```

> ![tip](/images/icons/tip.svg) Tip: Use a timeout for untrusted or expensive patterns. A regex timeout returns 3.
{.tip}

> ![note](/images/icons/note.svg) Note: `--engine` accepts aliases and is not case-sensitive. Aliases are `ES` for `ECMAScript`, `py` for `Python`, `pcre` for `Pcre2`, and `Java` for `JavaPattern`.

> ![warning](/images/icons/warning.svg) Warning: When stdout is piped, `--quiet` outputs only the exit code (0 for a match, 1 for no match). Otherwise, it returns a JSON string or just the exit code, depending on how many matches the pattern detects in the input.
{.warning}

#### `dnv regex explain` {#regex-explain}

#### Description {.desc}

Visualizes a regex as an abstract syntax tree so you can inspect how the engine interprets grouping, alternation, and quantifiers — much clearer than staring at the raw pattern when you are debugging a complex expression.

#### Syntax {.syntax}

`dnv regex explain [pattern] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[pattern]` | Required regex pattern, or stdin line-by-line when omitted |
| `--engine <engine>` | `dotnet`, `ECMAScript`, `Python`, `Pcre2`, or `JavaPattern` |
| `--options <options>` | Options for patterns not using slash flags |

#### Examples and notes {.examples}

```bash
dnv regex explain '/^(?=.*\\d).{8,}$/' --engine Pcre2
```

> ![tip](/images/icons/tip.svg) Tip: Use this before sharing a complex expression: it exposes grouping and operators as parsed rather than merely reprinting the pattern.
{.tip}

#### `dnv regex pattern` {#regex-pattern}

#### Description {.desc}

Lets you save, list, retrieve, import, edit, and delete named regular expressions — essentially a local pattern library so you do not have to search for or rewrite the same expressions across projects.

#### Syntax {.syntax}

`dnv regex pattern [pattern|name] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[pattern\|name]` | Pattern used by --save, or name to quickly get a pattern |
| `-s, --save <name>` | Save the positional pattern |
| `-i, --import <name>` | Import a saved pattern by name |
| `--del, --delete <name\|all>` | Delete one saved pattern or all patterns |
| `--force` | Skip delete confirmation |
| `--edit <name>` | Edit and overwrite a saved pattern |
| `--list` | List saved patterns |
| `-c, --copy` | Copy a selected/imported pattern |
| `-q, --quiet` | Raw pattern output or option-specific exit code |

#### Examples and notes {.examples}

```bash
dnv regex pattern '/^[^@]+@[^@]+$/' --save email
dnv regex pattern email -q
dnv regex pattern --del email
```

> ![note](/images/icons/note.svg) Note: `all` is reserved as a saved name and cannot be used for your own patterns. If you decline a deletion confirmation, the command returns exit code 4. Some action combinations — such as `--save` with `--delete` — are rejected because they conflict, so you can only perform one type of operation per invocation.

### `dnv uuid` {#uuid}

Use the UUID commands whenever you need a unique identifier — whether you want a random V4, a name-based V5, or a time-ordered V7 — and you can also validate existing UUIDs or decode them to inspect their structure.

#### `dnv uuid generate` (alias: `dnv uuid gen`) {#uuid-generate}

#### Description {.desc}

Generates UUIDs according to your chosen version — V4 (random), V5 (name-based with a namespace), or V7 (timestamp-ordered) — so you can pick the type that fits your use case rather than relying on a single default.

#### Syntax {.syntax}

`dnv uuid generate [V5_Name] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[V5_Name]` | Name for V5 UUID generation, or stdin when omitted |
| `--type <type>` | `V4` (default), `V5`, or `V7` |
| `--ns, --namespace <dns\|url\|oid\|x500\|yourcustomUUID>` | V5 namespace |
| `-r, --repeat <n>` | Number to generate |
| `--upper`, `--uppercase` | Uppercase output |
| `--nd, --no-dashes` | Compact output |
| `-c, --copy` | Copy one UUID |
| `-o, --output <path>` | `.json`, `.urn`, `.sql`, `.txt`, or `.hex`; defaults to `.json` |
| `-q, --quiet` | JSON stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv uuid generate --type V7
dnv uuid gen 'customer-42' --type V5 --namespace dns
dnv uuid generate -r 5 -o ids.urn
```

> ![note](/images/icons/note.svg) Note: V5 requires a name (as an argument or via stdin), while V4 and V7 reject supplied input — so you cannot pass a value to them. A namespace is only valid with V5.

#### `dnv uuid validate` {#uuid-validate}

#### Description {.desc}

Validates one or more UUIDs — either the value you pass directly or those found inside a file — which is useful when you need to check that an identifier conforms to a specific version before using it.

#### Syntax {.syntax}

`dnv uuid validate [uuid|filePath] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[uuid\|filePath]` | UUID to validate, or a file path containing UUIDs, or stdin if omitted |
| `--type <type>` | Expected UUID(s) version(s) for validation. (default: V4) |
| `-f, --file` | Treat input a file path containing UUIDs |
| `-q, --quiet` | JSON stdout |

#### Examples and notes {.examples}

```bash
dnv uuid validate 550e8400-e29b-41d4-a716-446655440000 --type V4
dnv uuid validate ids.txt --file --type V4,V7 -q
```

> ![note](/images/icons/note.svg) Note: Invalid UUIDs and unknown type syntax are input errors (exit code 2); a missing file is exit code 5. `--type` accepts comma-separated expected versions and is not restricted to V4, V5, or V7.

#### `dnv uuid inspect` {#uuid-inspect}

#### Description {.desc}

Decodes and displays detailed information about a UUID — or about multiple UUIDs read from a file — so you can examine version, variant, and timestamp fields at a glance without having to parse the raw hex yourself.

#### Syntax {.syntax}

`dnv uuid inspect [uuid|filePath] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[uuid\|filePath]` | UUID to inspect, or a file path containing UUIDs, or stdin if omitted |
| `-o, --output <PATH>` | Write inspection results to the specified file. Format is always .json |
| `-f, --file` | Treat input a file path containing UUIDs |
| `-q, --quiet` | JSON stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv uuid inspect 550e8400-e29b-41d4-a716-446655440000
dnv uuid inspect ids.txt --file -o inspection.json
```

> ![warning](/images/icons/warning.svg) Warning: Do not provide both an argument and piped input together, because the command requires a single input source to avoid ambiguity. Input that is not a valid UUID is rejected.
{.warning}

### `dnv cert` {#cert}

Use the cert module when you need a self-signed certificate for development or testing, cryptographic keys, or when you want to inspect a local certificate file or fetch one from a remote domain — so you can easily diagnose TLS issues.

#### `dnv cert generate` (alias: `dnv cert gen`) {#cert-generate}

#### Description {.desc}

Generates a self-signed certificate along with its private key material, which is useful when you need a quick TLS certificate for local development without setting up a full CA infrastructure.

#### Syntax {.syntax}

`dnv cert generate <outputPath> [subject] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<outputPath>` | Required output path; `.pem`, `.der`, or `.pfx` (extensionless becomes `.pem`) |
| `[subject]` | OpenSSL-style subject, such as `/CN=localhost`; stdin when omitted |
| `-a, --algorithm <algo>` | `RSA` (default) or `ECDSA` |
| `--hash <algo>` | `SHA256` (default), `SHA384`, or `SHA512` |
| `--ks, --key-size <n>` | RSA 2048 (default)/4096; ECDSA 256/384/521 |
| `--ec, --ec-curve <curve>` | `P256` (default), `P384`, or `P521` for ECDSA |
| `--days <n>` | Validity days; default 365 |
| `--ca` | Mark as a Certificate Authority (CA) |
| `--server` | Make a server certificate |
| `--sans <sans>` | Comma-separated subject alternative names |
| `--export, --export-keys` | Write separate `.key` and `.pub` files |
| `--kpw, --keys-password` | Prompt for the exported private-key password |
| `--kpwe <var>, --keys-password-env <VAR>` | Load for the exported private-key password |
| `--pw-env <var>` | PFX password environment variable |
| `--aiai, --aia-issuer <URL>` | CA Issuers URL for Authority Information Access (AIA) extension |
| `--ao, --aia-ocsp <URL>` | OCSP responder URL for Authority Information Access (AIA) extension |
| `--cdp <URL>` | CRL Distribution Point (CDP) URL |
| `-q, --quiet` | Exit code without prompts |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv cert generate dev.pem /CN=localhost --sans localhost,127.0.0.1 --server
dnv cert gen internal-ca.pem /CN=InternalCA --ca --days 3650
```

> ![note](/images/icons/note.svg) Note: PFX output and exported separate keys cannot be combined — choose one format. Quiet PFX generation requires `--pw-env` because there is no terminal to prompt for a password, so set the variable beforehand for non-interactive use.

#### `dnv cert inspect` {#cert-inspect}

#### Description {.desc}

Parses a local PEM, DER, or PFX certificate so you can examine its fields, or obtains a certificate directly from a domain — which saves you from having to download it separately when troubleshooting TLS.

#### Syntax {.syntax}

`dnv cert inspect [certPath|domainName] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[certPath\|domainName]` | .crt, .pem, .der, or .pfx certificate or domain name to inspect. Read from stdin if omitted |
| `--domain` | Treat input as a domain and retrieve its certificate
| `-w, --warn-days <n>` | Check expiry within N days |
| `--field <expiry\|issuer\|serialNumber\|algo>` | Return selected comma-separated fields |
| `--pw-env <var>` | PFX password variable |
| `-o, --output <json>` | JSON file output only |
| `-q, --quiet` | JSON stdout only |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv cert inspect ./server.pem --field expiry,issuer
dnv cert inspect example.com --domain --warn-days 30 -q
```

> ![note](/images/icons/note.svg) Note: By default, the target port is 443 on HTTPS or 80 on HTTP. HTTP scheme must be explicit if not using HTTPS.

> ![note](/images/icons/note.svg) Note: PFX inspection in quiet mode requires `--pw-env` since no terminal is available to enter a password.

### `dnv random` {#random}

The random module covers the kinds of random values you commonly need — strings, integers, bytes, passwords, and picks from a list. A `--seed` option is available on non-cryptographic generators so you can reproduce the same sequence when testing, but do not use it for secrets because seeded generators are not cryptographically secure.

#### `dnv random string` (alias: `str`) {#random-string}

#### Description {.desc}

Generates random strings with a default length of 30 characters and an alphanumeric charset, though you can adjust both — useful when you need identifiers, tokens, or sample data on demand.

#### Syntax {.syntax}

`dnv random string [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `--len, --length <n>` | String length; default 30 |
| `--char, --charset <charset>` | `alpha`, `alnum`, `lower`, `upper`, `hex`, or `custom:chars`; default `alnum` |
| `-r, --repeat <n>` | Number of strings to generate |
| `--seed <n>` | Seed for reproducible non-cryptographic output |
| `-c, --copy` | Copy one result |
| `-o, --output <path>` | `.json` or `.hex` (hex charset only); default `.json` |
| `-q, --quiet` | Raw output to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv random str --length 20 --charset upper
dnv random string --charset custom:ABC123 --seed 7 -r 3 -q
```

> ![note](/images/icons/note.svg) Note: Custom charsets must contain characters after `custom:`, or the charset is invalid.

#### `dnv random int` {#random-int}

#### Description {.desc}

Generates a random 64-bit integer, optionally constrained to a range — so you can pick a port number between 1024 and 65535, for instance, without having to implement the random logic yourself.

#### Syntax {.syntax}

`dnv random int [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `--lim, --limit <min:max>` | Range constraint for the generated integer |
| `-r, --repeat <n>` | Number of integers to generate |
| `--seed <n>` | Seed for reproducible non-cryptographic output |
| `-c, --copy` | Copy one result |
| `-o, --output <path>` | JSON output file |
| `-q, --quiet` | Raw JSON to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv random int --limit 1:100
dnv random int --limit 0:255 -r 10 -o samples.json
```

> ![note](/images/icons/note.svg) Note: The minimum value cannot exceed the maximum in `--limit <min:max>`; the default range is -9223372036854775808 to 9223372036854775807. Output files must use the `.json` extension.

#### `dnv random bytes` {#random-bytes}

#### Description {.desc}

Generates a specified number of random bytes, output as hex by default. Use `--secure` when you need cryptographically secure randomness — for keys, salts, or nonces — as opposed to the default pseudo-random generator which is faster but not suitable for security purposes.

#### Syntax {.syntax}

`dnv random bytes [bytesCount] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[bytesCount]` | Number of bytes to generate. Read from stdin if omitted. (default: 16) |
| `--format <format>` | `hex` (default), `upper`, or `bin` |
| `-r, --repeat <n>` | Number of byte sequences to generate |
| `--secure` | Use cryptographically secure random output |
| `--seed <n>` | Seed for reproducible non-cryptographic output |
| `-c, --copy` | Copy one result |
| `-o, --output <path>` | `.hex`, `.bin`, or `.json`; default `.hex` |
| `-q, --quiet` | Raw output to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv random bytes 32 --secure -q
dnv random bytes 16 --format bin -o nonce.bin
```

> ![warning](/images/icons/warning.svg) Warning: Use `--secure` for keys, salts, or nonces — the default generator is not cryptographically secure. The output extension must match the format (`.hex` for hex, `.bin` for binary). `--secure` and `--seed` cannot be combined.
{.warning}

#### `dnv random password` (alias: `pw`) {#random-password}

#### Description {.desc}

Generates cryptographically secure passwords using a strong random source, which is safer than rolling your own password generation in a script because it avoids predictable patterns.

#### Syntax {.syntax}

`dnv random password [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `--len, --length <n>` | Password length |
| `--char, --charset <charset>` | Character set for the password |
| `-r, --repeat <n>` | Number of passwords to generate |
| `--no-symbols` | Exclude symbols from the password |
| `-c, --copy` | Copy one result |
| `-o, --output <path>` | JSON output file |
| `-q, --quiet` | Raw JSON to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv random pw --length 24 --copy
dnv random password --no-symbols --length 20 -r 5 -o passwords.json
```

> ![warning](/images/icons/warning.svg) Warning: Avoid printing a production password to a shared terminal where it could be visible to others.
{.warning}

#### `dnv random pick` {#random-pick}

#### Description {.desc}

Chooses one item at random from a comma-separated list you provide, which is handy when you need to pick a winner, select a random configuration profile, or shuffle decision-making in a script.

#### Syntax {.syntax}

`dnv random pick [choices] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[choices]` | Comma-separated list of items to pick from; stdin when omitted |
| `-r, --repeat <n>` | Number of picks to perform |
| `--seed <n>` | Seed for reproducible non-cryptographic output |
| `-c, --copy` | Copy one result |
| `-q, --quiet` | Raw JSON to stdout |

#### Examples and notes {.examples}

```bash
dnv random pick red,green,blue
dnv random pick a,b,c,d --repeat 3 --seed 11 -q
```

> ![note](/images/icons/note.svg) Note: An empty list is invalid. Use `--seed` only for deterministic selection — never for secrets.

### `dnv time` {#time}

The time module works with the three formats you are most likely to encounter — Unix timestamps, ISO 8601 strings, and the shorthand `now` — so you can convert, compare, or adjust time values without worrying about the format mismatch between different data sources. The `--utc` and `--timezone` options only apply when the input is `now`.

#### `dnv time convert` {#time-convert}

#### Description {.desc}

Converts a time value into the representation you need — ISO 8601, RFC 3339, Unix timestamp, or a local or UTC datetime — which saves you from having to look up the format string every time.

#### Syntax {.syntax}

`dnv time convert [timeValue] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[timeValue]` | Unix timestamp, ISO 8601, or `now` |
| `--to <format>` | `iso` (default), `rfc3339`, `unix`, `unixms`, `datetime`, `utc`, or `local` |
| `-u, --utc` | Use UTC (input must be `now`) |
| `--tz, --timezone <zone>` | IANA timezone (input must be `now`); conflicts with `--utc` |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv time convert 1719090000 --to iso
dnv time convert now --to rfc3339 --timezone Europe/Paris
```

> ![note](/images/icons/note.svg) Note: Provide the value as an argument or through stdin, but not both — the command requires a single input source.

> ![tip](/images/icons/tip.svg) Tip: `--timezone` is not case-sensitive.
{.tip}

#### `dnv time diff` {#time-diff}

#### Description {.desc}

Computes the difference between two time values and reports it in the unit you choose — useful when you need to measure elapsed time or check whether a deadline has passed.

#### Syntax {.syntax}

`dnv time diff <timeA> [timeB] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<timeA>` | First time value (required) |
| `[timeB]` | Second time value; stdin when omitted |
| `--unit <unit>` | `ns`, `mcs`, `ms`, `s`, `m`, `h`, or `d` |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv time diff 1719090000 1719176400 --unit h
dnv time diff 2024-06-21T12:00:00Z now
```

> ![tip](/images/icons/tip.svg) Tip: Use `--unit` when your script needs a consistent unit for further processing, rather than parsing the human-readable default output.
{.tip}

#### `dnv time add` {#time-add}

#### Description {.desc}

Adds a duration or individual time units to a given value, which is convenient when you want to compute an expiration date, schedule a future event, or shift a timestamp without date-math errors.

#### Syntax {.syntax}

`dnv time add [timeValue] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[timeValue]` | Unix timestamp, ISO 8601, or `now` |
| `--years <n>` | Number of years to add |
| `--months <n>` | Number of months to add |
| `--days <n>` | Number of days to add |
| `--hours <n>` | Number of hours to add |
| `--minutes <n>` | Number of minutes to add |
| `--seconds <n>` | Number of seconds to add |
| `--duration <duration>` | Duration string such as `1y2mo3d4h5m6s`; conflicts with individual unit options |
| `-u, --utc` | Use UTC (input must be `now`) |
| `--tz, --timezone <zone>` | IANA timezone (input must be `now`); conflicts with `--utc` |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv time add now --days 7
dnv time add 2024-06-21T12:00:00Z --duration 1mo2d
```

> ![note](/images/icons/note.svg) Note: At least one unit is required — you cannot call the command with no time adjustment. Also, `--duration` cannot be mixed with individual unit options like `--days` or `--hours` because they represent two alternative ways to specify the same thing.

### `dnv http` {#http}

The HTTP module gives you quick access to status codes, response headers, and endpoint timing — everything you need to diagnose a remote service without leaving the terminal. Network failures return exit code 6, while timeouts return exit code 3.

#### `dnv http status` {#http-status}

#### Description {.desc}

Looks up what a status code or category means — useful when you encounter an unfamiliar code — or fetches the actual response status from a remote domain if you pass `--domain`.

#### Syntax {.syntax}

`dnv http status [code|domainName] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[code\|domainName]` | Status code, category (e.g.`4xx`), or domain name |
| `--domain` | Treat input as a domain and connect to it |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv http status 429
dnv http status 4xx
dnv http status example.com:8443 --domain -q
```

> ![note](/images/icons/note.svg) Note: By default, the target port is 443 on HTTPS or 80 on HTTP. HTTP scheme must be explicit if not using HTTPS.

#### `dnv http headers` {#http-headers}

#### Description {.desc}

Fetches the response headers a domain sends back, which helps you inspect caching policies, content types, or server identity without using a browser's developer tools.

#### Syntax {.syntax}

`dnv http headers [domainName] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[domainName]` | Domain to fetch headers from; stdin when omitted |
| `--follow` | Follow redirects |
| `--redirects <n>` | Maximum redirects to follow; default 50 |
| `--header <name>` | Return only the specified header |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv http headers example.com --follow
dnv http headers example.com --header content-type -q
```

> ![note](/images/icons/note.svg) Note: By default, the target port is 443 on HTTPS or 80 on HTTP. HTTP scheme must be explicit if not using HTTPS.

> ![Tip](/images/icons/tip.svg) Tip: Use `--follow` when a redirect response is not the final result you need — the command will follow the chain until it reaches a non-redirect status.

#### `dnv http timing` {#http-timing}

#### Description {.desc}

Measures each phase of the connection — DNS resolution, TCP handshake, TLS negotiation, time to first byte, and total response — so you can pinpoint where a slow endpoint is spending its time.

#### Syntax {.syntax}

`dnv http timing [domainName] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[domainName]` | Domain to time the connection to |
| `-r, --repeat <n>` | Number of requests; default 1 |
| `-q, --quiet` | JSON output to stdout |

#### Examples and notes {.examples}

```bash
dnv http timing example.com
dnv http timing example.com:8443 --repeat 3 -q
```

> ![note](/images/icons/note.svg) Note: By default, the target port is 443 on HTTPS or 80 on HTTP. HTTP scheme must be explicit if not using HTTPS.

> ![tip](/images/icons/tip.svg) Tip: Use the quiet JSON output when you need to compare successive measurements in a script — it is easier to parse than the human-readable table.
{.tip}

### `dnv url` {#url}

#### `dnv url inspect` {#url-inspect}

#### Description {.desc}

Parses a URL into its components — scheme, host, port, path, query, and fragment — so you can examine or extract any part without writing your own URL parser or reaching for a browser.

#### Syntax {.syntax}

`dnv url inspect [URL] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[URL]` | URL to inspect; reads from stdin when omitted |
| `-b, --base <url>` | Resolve a relative URL against a base |
| `--field <field>` | Return one available field |
| `-o, --output <path>` | JSON file output only |
| `-q, --quiet` | JSON stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv url inspect 'https://example.com:8443/path?q=hello&n=1#frag'
dnv url inspect /docs --base https://example.com --field host
```

> ![note](/images/icons/note.svg) Note: `--field` and `--output` cannot be combined because they target different output forms (one filters to a single field, the other writes a full JSON file). If you omit the extension on the output path, `.json` is added by default.

#### `dnv url encode` {#url-encode}

#### Description {.desc}

Encodes a string so it can be safely included in a URL, replacing characters that would otherwise be ambiguous or invalid — useful when you are building query strings or API calls in a script.

#### Syntax {.syntax}

`dnv url encode [value] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[value]` | String to URL-encode; stdin when omitted |
| `--comp, --component <mode>` | `full` (default) or `query` encoding mode |
| `-c, --copy` | Copy the result |
| `-q, --quiet` | Raw output to stdout |

#### Examples and notes {.examples}

```bash
dnv url encode 'hello world&x=1' -q
dnv url encode 'q=hello world&lang=en' --component query
```

> ![note](/images/icons/note.svg) Note: `full` is the default component mode and encodes all characters that are not permitted in a URL. `query` mode is intended for encoding query string representations. Empty input is rejected.

#### `dnv url decode` {#url-decode}

#### Description {.desc}

Decodes URL-encoded text back to its original form, which is the counterpart to `encode` and works with the same component modes so you can safely round-trip values.

#### Syntax {.syntax}

`dnv url decode [value] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `[value]` | URL-encoded string to decode; stdin when omitted |
| `--comp, --component <mode>` | `full` or `query` decoding mode |
| `--strict` | Reject malformed percent sequences |
| `-c, --copy` | Copy the result |
| `-q, --quiet` | Raw output to stdout |

#### Examples and notes {.examples}

```bash
dnv url decode 'hello%20world%26x%3D1' --strict -q
```

### `dnv json` {#json}

The JSON module lets you query values, pick or omit fields recursively, and compare documents semantically — so you can inspect and filter JSON data without piping or writing ad-hoc scripts. Note that file inputs require the `--file` flag where listed.

#### `dnv json get` {#json-get}

#### Description {.desc}

Extracts values from a JSON document using a simple field name, a `::`-separated path for exact navigation, or a full RFC 9535 JSONPath expression when you need more advanced queries — so you can pick the syntax that matches the complexity of your data.

#### Syntax {.syntax}

`dnv json get <path> [JSON|JSON_File_Path] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<path>` | Field, exact `::` path, or JSONPath with `--jsonpath` |
| `[JSON\|JSON_File_Path]` | JSON document or file path (with --file), or pipe from stdin |
| `--jsonpath` | Treat path as literal RFC 9535 JSONPath |
| `-f, --file` | Treat input as a file path |
| `-o, --output <path>` | JSON output file only |
| `-q, --quiet` | JSON stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv json get name '{"user":{"name":"Alice"}}'
dnv json get user::name data.json --file
dnv json get '$..author' books.json --jsonpath --file -q
```

> ![note](/images/icons/note.svg) Note: With the default syntax, `name` searches recursively through all levels, while `user::name` follows an exact path. A query that finds no match is not an error — it simply returns nothing. Invalid JSON or JSONPath syntax produces error code 2.

#### `dnv json pick` {#json-pick}

#### Description {.desc}

Keeps only the fields you name, recursively, throughout the entire JSON document — useful when you want to strip down a large response to the few fields that matter before logging or displaying it.

#### Syntax {.syntax}

`dnv json pick <fields> [JSON|JSON_File_Path] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<fields>` | Comma-separated field names to retain |
| `[JSON\|JSON_File_Path]` | JSON document or file path (with `--file`), or pipe from stdin |
| `-f, --file` | Treat input as a file path |
| `-o, --output <path>` | JSON output file |
| `-q, --quiet` | JSON output to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv json pick name,version data.json --file
printf '%s' '{"id":1,"secret":"x"}' | dnv json pick id -q
```

> ![note](/images/icons/note.svg) Note: Parent branches that contain at least one matching field are retained, while branches with no matches are removed — so the overall structure is preserved where it matters. Output paths must use the `.json` extension.

#### `dnv json omit` {#json-omit}

#### Description {.desc}

Removes the fields you name, recursively, throughout the entire JSON document — the inverse of `pick`, useful when you want to redact sensitive fields like `password` or `apiKey` before sharing.

#### Syntax {.syntax}

`dnv json omit <fields> [JSON|JSON_File_Path] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<fields>` | Comma-separated field names to remove |
| `[JSON\|JSON_File_Path]` | JSON document or file path (with `--file`), or pipe from stdin |
| `-f, --file` | Treat input as a file path |
| `-o, --output <path>` | JSON output file |
| `-q, --quiet` | JSON output to stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv json omit password,apiKey data.json --file -o sanitized.json
```

> ![tip](/images/icons/tip.svg) Tip: Use `omit` before logging or sharing JSON that contains sensitive fields — it saves you from having to manually redact values in a text editor.
{.tip}

#### `dnv json diff` {#json-diff}

#### Description {.desc}

Compares two JSON documents semantically — ignoring key order and formatting — and reports what was added, removed, or changed, which saves you from doing a manual diff when you need to verify that a transformation or API response has not introduced unexpected differences.

#### Syntax {.syntax}

`dnv json diff <JSON-1|JSON_File_Path-1> [JSON-2|JSON_File_Path-2] [options]`

#### Arguments and options {.args}

| Item | Meaning |
| --- | --- |
| `<JSON-1\|JSON_File_Path-1>` | The first JSON string or path |
| `[JSON-2\|JSON_File_Path-2]` | The second JSON string or path. Read from stdin if omitted |
| `-f, --file` | Treat both inputs as file paths |
| `--iao, --ignore-array-order` | Ignore array element order |
| `-o, --output <path>` | JSON output file only |
| `-q, --quiet` | JSON stdout |
| `--force` | Overwrite existing output file without prompting |

#### Examples and notes {.examples}

```bash
dnv json diff before.json after.json --file
dnv json diff a.json b.json --file --ignore-array-order -q
```

> ![note](/images/icons/note.svg) Note: Object key order and whitespace formatting do not affect the comparison — only the actual values matter. Array order is significant unless you set `--ignore-array-order`. The first JSON document is always used as the reference.

## Complete route and alias reference {#route-reference}

| Route | Aliases |
| --- | --- |
| `update` | — |
| `stats` | — |
| `crypto hash`, `crypto hmac` | — |
| `jwt generate`, `jwt inspect` | `jwt gen` |
| `base64 encode`, `base64 decode` | `base64 enc`, `base64 dec`; module alias `b64` with the same command aliases |
| `regex test`, `regex explain`, `regex pattern` | — |
| `uuid generate`, `uuid validate`, `uuid inspect` | `uuid gen` |
| `cert generate`, `cert inspect` | `cert gen` |
| `random string`, `random int`, `random bytes`, `random password`, `random pick` | `random str`, `random pw` |
| `time convert`, `time diff`, `time add` | — |
| `http status`, `http headers`, `http timing` | — |
| `url inspect`, `url encode`, `url decode` | — |
| `json get`, `json pick`, `json omit`, `json diff` | — |

## FAQ {#faq}

### Why does a command reject both an argument and piped input? {#faq-ambiguous-input}

Pipeable arguments requires a single input source to avoid ambiguity. Pass the value either as an argument or through stdin.

### Why did `--copy` fail with `--quiet` or `--repeat`? {#faq-copy-quiet}

Commands that copy a result require exactly one interactive result. Generate one value without quiet mode, or write/pipe multiple values instead.

### Why did my output path gain an extension? {#faq-output-extension}

Several commands add their documented default extension when the supplied output path has none. They reject unsupported extensions rather than silently changing the format. However, the extension may change if the output contains several elements.

### Can I use MD5 or SHA-1? {#faq-weak-algos}

`crypto hash` and `crypto hmac` support them, but the CLI identifies them as weak. Prefer SHA-256 or stronger; use `--no-warn` only when compatibility requires the older algorithm.

### Does `jwt inspect` verify every token? {#faq-jwt-verify}

No. It decodes a token by itself. Supply a supported secret or public key and algorithm to verify a signature.

### How do I diagnose an endpoint that fails? {#faq-diagnose-endpoint}

Use `dnv http status <domain> --domain` for the status, `dnv http headers <domain>` for headers, and `dnv http timing <domain>` for phase timings. Exit code 3 indicates a timeout; 6 indicates a network failure.