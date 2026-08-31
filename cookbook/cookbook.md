# Denev Cookbook {#introduction}

Solve the annoying stuff. Stay in the terminal.

Not every developer problem deserves a script, a browser tab, or another dependency.

Denev brings the small tools you reach for every day into one consistent CLI — so the five-minute problems stay five-minute problems.

Every recipe follows the same shape: the problem states the question, *The recipe* answers it with commands, and *Why Denev?* tells you what makes the answer worth keeping. No theory in between.

Two rules apply to every command: input can come from an argument *or* from a pipe (stdin), and adding `--quiet` (`-q`) gives you clean, machine-friendly output. The examples show both.

## Table of contents

- [01 — Extract what you actually need from a JSON payload](#1)
- [02 — Debug a JWT without leaving your terminal](#2)
- [03 — Find out why an endpoint is slow](#3)
- [04 — Stop fighting with regex](#4)
- [05 — Get HTTPS running locally without turning it into a project](#5)
- [06 — Make sense of timestamps before they make a mess of your application](#6)

---

## 01 — Extract what you actually need from a JSON payload {#1}

### The problem {.section}

You're debugging an API response. It's 200 lines of nested JSON, but you only need `user.name` — or you need to remove a couple of sensitive fields before sending the payload to someone else.

How do you get just that field, or clean payload, without writing a script?

### The recipe {.section}

**Need a single field?**

```bash
dnv json get user::name response.json --file
```

<pre><code><span class="cb-bold cb-blue">Path</span>: user::name
<span class="cb-bold cb-blue">JsonPath</span>: $[&#x27;user&#x27;][&#x27;name&#x27;]
<span class="cb-bold cb-blue">Matches</span>: 1
────────────────────
[1] (String) <span class="cb-bold cb-purple">"ada"</span>
</code></pre>

**Need several fields?**

```bash
dnv json pick name,version response.json --file
```

<pre><code><span class="cb-bold cb-blue">New JSON string:</span>
────────────────────
<span class="cb-green">{</span>
<span class="cb-green">  "user": {</span>
<span class="cb-green">    "name": "ada"</span>
<span class="cb-green">  },</span>
<span class="cb-green">  "version": "1.2"</span>
<span class="cb-green">}</span>
</code></pre>

**Need to sanitize a payload before sharing it?**

```bash
dnv json omit password,apiKey data.json --file -o sanitized.json
```

<pre><code><span class="cb-bold cb-blue">New JSON string:</span>
────────────────────
<span class="cb-green">{</span>
<span class="cb-green">  "user": {</span>
<span class="cb-green">    "name": "ada",</span>
<span class="cb-green">    "role": "admin"</span>
<span class="cb-green">  },</span>
<span class="cb-green">  "secret": "x",</span>
<span class="cb-green">  "version": "1.2"</span>
<span class="cb-green">}</span>
<span class="cb-bold cb-green">The file has been successfully created: sanitized.json</span>
</code></pre>

**Is your JSON on stdout instead of in a file?**

```bash
printf '%s' '{"id":1,"secret":"x"}' | dnv json pick id -q
```

<pre><code>{
  "id": 1
}
</code></pre>

*Note on the syntax: a single name (`name`) is a recursive search — it finds that field wherever it's nested. Chained names (`user::name`) walk the levels exactly: `user` ➜ `name`. Use `*` for a wildcard level, `[0]` for an array index, and `--jsonpath` for full RFC 9535 JSONPath.*

### Why Denev? {.section}

Because `pick` and `omit` work recursively, you don't have to worry about where those fields are nested.

No temporary script. No context switch. No need to remember a different tool for every JSON operation.

Just extract, filter, or sanitize the data and keep moving.

---

## 02 — Debug a JWT without leaving your terminal {#2}

### The problem {.section}

An authenticated request suddenly returns 401.

The token looks fine. The API disagrees.

What's actually inside the token — and was it signed with the expected secret or key?

### The recipe {.section}
 
**What's inside the token?**

```bash
dnv jwt inspect "$TOKEN"
```

<pre><code><span class="cb-bold cb-blue">Headers:</span>
alg = HS256

typ = JWT

<span class="cb-bold cb-blue">Payload (Claims):</span>
sub = user-42<span class="cb-dim">(string type)</span>

role = user<span class="cb-dim">(string type)</span>

aud = dashboard<span class="cb-dim">(string type)</span>
</code></pre>

**Was it signed with the expected secret?**

```bash
dnv jwt inspect "$TOKEN" \
  --secret-env JWT_SECRET \
  --algorithm HS256
```

<pre><code><span class="cb-bold cb-blue">Headers:</span>
alg = HS256

typ = JWT

<span class="cb-bold cb-blue">Payload (Claims):</span>
sub = user-42<span class="cb-dim">(string type)</span>

role = user<span class="cb-dim">(string type)</span>

aud = dashboard<span class="cb-dim">(string type)</span>

<span class="cb-green">JWT&#x27;s signature </span><span class="cb-bold cb-underline cb-green">is</span><span class="cb-green"> valid</span>
</code></pre>

**Need a token for a local test?**

```bash
dnv jwt generate '{"role":"user"}' \
  --secret-env JWT_SECRET \
  --sub user-42 \
  --aud dashboard \
  -q
```

<pre><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwicm9sZSI6InVzZXIiLCJhdWQiOiJkYXNoYm9hcmQifQ.1inE4B0vOBOdnEYZlaY-9MO7DYOByeO8X77sDN3dxiQ
</code></pre>

### Why Denev? {.section}

JWT debugging shouldn't require copying credentials into a web-based decoder or maintaining a throwaway script.

Inspect, verify, and generate tokens locally — with the same CLI you're already using for everything else.

---

## 03 — Find out why an endpoint is slow {#3}

### The problem {.section}

"It's slow."

That's not a diagnosis.

Is DNS taking too long? TLS negotiation? The TCP connection? The server's time to first byte?

### The recipe {.section}

**Where does the time go?**

```bash
dnv http timing example.com
```

<pre><code>
╭──────────┬──────────┬──────────┬───────────┬────────────╮
│ <span class="cb-green">DNS (ms)</span> │ <span class="cb-yellow">TCP (ms)</span> │ <span class="cb-blue">TLS (ms)</span> │ <span class="cb-purple">TTFB (ms)</span> │ <span class="cb-cyan">Total (ms)</span> │
├──────────┼──────────┼──────────┼───────────┼────────────┤
│ 7        │ 25       │ 71       │ 78        │ 183        │
╰──────────┴──────────┴──────────┴───────────┴────────────╯
<span class="cb-blue">Average response time:</span> 183ms
</code></pre>

**Is the slowness consistent?**

```bash
dnv http timing example.com --repeat 3 -q
```

<pre><code>{
  "DNS": [
    6,
    1,
    0
  ],
  "TCP": [
    25,
    19,
    18
  ],
  "TLS": [
    85,
    21,
    20
  ],
  "TTFB": [
    81,
    86,
    84
  ],
  "Total": [
    198,
    127,
    122
  ]
}
</code></pre>

**What is the server actually sending back?**

```bash
dnv http headers example.com --follow
```

<pre><code>
╭───────────────────┬───────────────────────────────╮
│ <span class="cb-green">Header</span>            │ <span class="cb-yellow">Value</span>                         │
├───────────────────┼───────────────────────────────┤
│ Date              │ Sat, 15 Aug 2026 10:31:36 GMT │
├───────────────────┼───────────────────────────────┤
│ Transfer-Encoding │ chunked                       │
├───────────────────┼───────────────────────────────┤
│ Connection        │ keep-alive                    │
├───────────────────┼───────────────────────────────┤
│ Server            │ cloudflare                    │
├───────────────────┼───────────────────────────────┤
│ Accept-Ranges     │ bytes                         │
├───────────────────┼───────────────────────────────┤
│ Age               │ 6064                          │
├───────────────────┼───────────────────────────────┤
│ cf-cache-status   │ HIT                           │
├───────────────────┼───────────────────────────────┤
│ CF-RAY            │ a2b787d42d08d506-CDG          │
╰───────────────────┴───────────────────────────────╯
</code></pre>

### Why Denev? {.section}

Instead of guessing where the latency comes from, get the useful signals directly in your terminal.

DNS. TCP. TLS. TTFB. Total time.

One command, one place to start the investigation.

---

## 04 — Stop fighting with regex {#4}

### The problem {.section}

The regex is three lines long.

Nobody remembers why the third lookahead exists.

And now it behaves differently in another runtime.

### The recipe {.section}

**Does the pattern match my input?**

```bash
dnv regex test '/\d+/' 'order-42'
```

<pre><code>╭─Recapitulative───────╮
│ <span class="cb-blue">Regex Pattern:</span> \d+   │
│ <span class="cb-blue">Flags/Options:</span>       │
│ <span class="cb-blue">Test Input:</span> order-42 │
│ <span class="cb-blue">Timeout (ms):</span> 2000   │
│ <span class="cb-blue">Engine:</span> .NET         │
╰──────────────────────╯
<span class="cb-green">Match found</span>
</code></pre>

**What about several inputs at once?**

```bash
printf 'cat\ndog\n' | dnv regex test '/^d/' --all
```

<pre><code>dog
</code></pre>

**How is this expression structured?**

```bash
dnv regex explain '/^(?=.*\d).{8,}$/' \
  --engine Pcre2
```

<pre><code>╭─Regex Explain AST────────────────────────────────────────────────────────────╮
│                                                                              │
│  Pattern: <span class="cb-bold cb-yellow">^(?=.*\d).{8,}$</span>                                                    │
│  Flags:   <span class="cb-cyan">None</span>                                                               │
│  Length:  15 chars  |  Capturing groups: <span class="cb-bold">0</span> | Target: <span class="cb-cyan">PCRE2</span>                   │
│  Remark:  <span class="cb-bold cb-dim">The regex returned may not match the one you entered. In that </span>     │
│  <span class="cb-bold cb-dim">case, we recommend using quotation marks</span>                                    │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯

<span class="cb-bold cb-green">Syntaxic tree for:</span> <span class="cb-yellow">^(?=.*\d).{8,}$</span>
├── <span class="cb-light-purple">Anchor</span>: <span class="cb-yellow">^</span> <span class="cb-dim"> =&gt; Start of line / string</span>
├── <span class="cb-yellow">Positive lookahead</span> <span class="cb-dim"> =&gt; Look ahead: check that what follows matches, without </span>
│   <span class="cb-dim">consuming</span>
│   ├── <span class="cb-grey">Wildcard</span>: <span class="cb-yellow">. (*)</span> <span class="cb-dim"> =&gt; Any character (except line breaks by default) (0 or </span>
│   │   <span class="cb-dim">more times)</span>
│   └── <span class="cb-green">Shorthand class</span>: <span class="cb-yellow">\d</span> <span class="cb-dim"> =&gt; Any digit [0-9]</span>
├── <span class="cb-grey">Wildcard</span>: <span class="cb-yellow">. ({8,})</span> <span class="cb-dim"> =&gt; Any character (except line breaks by default) (Repeat</span>
│   <span class="cb-dim">{8,})</span>
└── <span class="cb-light-purple">Anchor</span>: <span class="cb-yellow">$</span> <span class="cb-dim"> =&gt; End of line / string</span>
</code></pre>

**Got a pattern worth keeping?**

```bash
dnv regex pattern '/^[^@]+@[^@]+$/' --save email
```

<pre><code><span class="cb-green">Successfully saved /^[^@]+@[^@]+$/ as &#x27;email&#x27;</span>
</code></pre>

### Why Denev? {.section}

Regex debugging is already difficult enough without hunting for an online tester every time.

Test locally, inspect the structure, check engine compatibility, and keep useful patterns around.

---

## 05 — Get HTTPS running locally without turning it into a project {#5}

### The problem {.section}

Your local service needs HTTPS.

Maybe you're testing secure cookies. Maybe an OAuth callback requires `https://`. Maybe a browser simply refuses to behave without TLS.

Now you're three commands deep into certificate generation, wondering why this was supposed to take two minutes.

### The recipe {.section}

**Need a development certificate?**

```bash
dnv cert generate dev.pem /CN=localhost \
  --sans localhost,127.0.0.1 \
  --server
```

<pre><code><span class="cb-bold cb-green">The file has been successfully created: dev.pem</span>
<span class="cb-cyan">Certificate summary:</span>
<span class="cb-blue">Thumbprint:</span> A5E6F209C1CF5182C23901787E33A3E1B68A5051
<span class="cb-blue">Valid from:</span> 2026-08-15 12:26:37
<span class="cb-blue">Valid until:</span> 2027-08-15 12:31:37
<span class="cb-blue">Subject:</span> CN=localhost
</code></pre>

**Need a local CA to sign everything else?**

```bash
dnv cert generate internal-ca.pem \
  /CN=InternalCA \
  --ca \
  --days 3650
```

<pre><code><span class="cb-bold cb-green">The file has been successfully created: internal-ca.pem</span>
<span class="cb-cyan">Certificate summary:</span>
<span class="cb-blue">Thumbprint:</span> 6543A21DFCE318EC76650D279F1F53EB80552D98
<span class="cb-blue">Valid from:</span> 2026-08-15 12:26:37
<span class="cb-blue">Valid until:</span> 2036-08-12 12:31:37
<span class="cb-blue">Subject:</span> CN=InternalCA
</code></pre>

**Have a certificate and want to know what's in it?**

```bash
dnv cert inspect ./server.pem \
  --field expiry,issuer
```

<pre><code><span class="cb-bold cb-blue">Not After:</span>
Aug 15 10:31:37 2027 GMT

<span class="cb-bold cb-blue">Issuer:</span>
CN=localhost
</code></pre>

**Need to check a remote certificate?**

```bash
dnv cert inspect example.com \
  --domain \
  --warn-days 30 \
  -q
```

<pre><code>{
  "subject": "CN=example.com",
  "issuer": "CN=Cloudflare TLS Issuing ECC CA 3, O=SSL Corporation, C=US",
  "serialNumber": "06:24:d0:ab:31:15:58:78:0b:7d:52:13:b9:63:18:31",
  "serialNumberRaw": "0624D0AB311558780B7D5213B9631831",
  "version": 3,
  "signatureAlgorithm": "sha256ECDSA",
  "validity": {
    "notBefore": "2026-07-29T22:10:08.0000000Z",
    "notAfter": "2026-10-27T22:17:21.0000000Z"
  },
  "publicKey": {
    "algorithm": "ECDSA",
    "keySize": 256,
    "curve": "ECDSA_P256",
    "publicKey": "04764e09a3ddb2cf45a54dd15b9df05100522333dd9d8177996d8b7f6e86ebc1011ca7f91e89264042bf9e1d9538b3cda501ccb9eb89a3d55bdbb2b182095d3562"
  },
  "extensions": [
    {
      "oid": "2.5.29.19",
      "name": "X509v3 Basic Constraints",
      "critical": true,
      "certificateAuthority": false
    },
    {
      "oid": "2.5.29.35",
      "name": "X509v3 Authority Key Identifier",
      "critical": false,
      "keyIdentifier": "8303fde7f6f54a4d1541f4ed2216d3320a3eca66"
    },
    {
      "oid": "1.3.6.1.5.5.7.1.1",
      "name": "Authority Information Access",
      "critical": false,
      "caIssuers": [
        "http://i.cf-i.ssl.com/Cloudflare-TLS-I-E3.cer"
      ],
      "ocsp": [
        "http://o.cf-i.ssl.com"
      ]
    },
    {
      "oid": "2.5.29.17",
      "name": "X509v3 Subject Alternative Name",
      "critical": false,
      "subjectAlternativeNames": [
        {
          "type": "DNS",
          "value": "example.com"
        },
        {
          "type": "DNS",
          "value": "*.example.com"
        }
      ]
    },
    {
      "oid": "2.5.29.32",
      "name": "X509v3 Certificate Policies",
      "critical": false
    },
    {
      "oid": "2.5.29.37",
      "name": "X509v3 Extended Key Usage",
      "critical": false,
      "enhancedKeyUsages": [
        "TLS Web Server Authentication"
      ]
    },
    {
      "oid": "2.5.29.31",
      "name": "X509v3 CRL Distribution Points",
      "critical": false
    },
    {
      "oid": "2.5.29.15",
      "name": "X509v3 Key Usage",
      "critical": true,
      "keyUsage": "Digital Signature"
    },
    {
      "oid": "1.3.6.1.4.1.44363.44",
      "name": "1.3.6.1.4.1.44363.44",
      "critical": false
    },
    {
      "oid": "1.3.6.1.4.1.11129.2.4.2",
      "name": "CT Precertificate SCTs",
      "critical": false
    }
  ],
  "thumbprint": "85DC256AA79431B0190F9C592B90C2E8E3B59B3E"
}
</code></pre>

### Why Denev? {.section}

TLS is complicated.

Getting a certificate for a development environment doesn't have to be.

Generate what you need, inspect what you have, and get back to the actual problem.

---

## 06 — Make sense of timestamps before they make a mess of your application {#6}

### The problem {.section}

One service gives you Unix timestamps.

Another sends ISO 8601.

Your logs use UTC.

Someone in the team is asking whether 1719176400 means Friday morning or Friday afternoon.

Time handling is simple — right up until it isn't.

### The recipe {.section}

**Is that Unix timestamp readable?**

```bash
dnv time convert 1719090000 --to iso
```

<pre><code><span class="cb-blue">Input:</span> 1719090000 (Unix seconds)
<span class="cb-blue">Timezone:</span> UTC
<span class="cb-blue">Result:</span> 2024-06-22T21:00:00.0000000+00:00 (iso)
</code></pre>

**What time is it right now in another timezone?**

```bash
dnv time convert now \
  --to rfc3339 \
  --timezone Europe/Paris
```

<pre><code><span class="cb-blue">Input:</span> now
<span class="cb-blue">Timezone:</span> Europe/Paris
<span class="cb-blue">Result:</span> 2026-08-15T12:31:39+02:00 (rfc3339)
</code></pre>

**How much time passed between two moments?**

```bash
dnv time diff \
  2024-06-21T12:00:00Z \
  now
```

<pre><code><span class="cb-green">2024-06-21T12:00:00Z is earlier than now with a difference of 784.9386493833159 </span>
<span class="cb-green">day(s)</span>
</code></pre>

**Need an expiration date a week from now?**

```bash
dnv time add now --days 7
```

<pre><code><span class="cb-green">The new date is 8/22/2026 12:31:39 PM +02:00</span>
</code></pre>

### Why Denev? {.section}

No mental arithmetic. No timestamp converter tab. No remembering obscure date-format syntax.

Convert, compare, and manipulate time values directly from the terminal.

---

## One CLI. A lot less friction.

These aren't complicated problems.

That's exactly the point.

They show up constantly, interrupt your flow, and rarely justify writing another script or opening another tool.

Denev gives them one consistent interface:

```text
dnv <module> <command> [arguments] [options]
```

Learn one command, and the next one already feels familiar.

## Give it a try

Linux, macOS, and Windows (Git Bash, WSL)

```bash
curl -fsSL https://denev.pages.dev/install.sh | bash
```

Windows x86_64 (PowerShell 5.1+)

```powershell
irm https://denev.pages.dev/install.ps1 | iex
```

Full command reference: [Documentation](https://denev.pages.dev/docs/latest/)