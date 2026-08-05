import { initAnalytics, trackCommandCopied } from '../analytics.js';
import Typewriter from "typewriter-effect/dist/core";

initAnalytics();

const terminal = document.getElementById('terminal-output');
const terminalQuiet = document.getElementById('terminal-output-quiet');

const typewriter = new Typewriter(terminal, { loop: true, delay: 75, skipAddStyles: true });
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

function toRFC3339(date = new Date()) {
    const pad = n => String(n).padStart(2, "0");

    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
        `${sign}${hours}:${minutes}`
    );
}

const exp = Math.floor(Date.now() / 1000);

const payload = {
  sub: "dev-42",
  role: "admin",
  exp: exp,
};

const payload64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

typewriter
    .pauseFor(1000)
    .typeString('dnv http timing api.example.com')
    .pasteString("<br>╭──────────┬──────────┬──────────┬───────────┬────────────╮")
    .pasteString("<br>│ <span class='c-green'>DNS (ms)</span> │ <span class='c-yellow'>TCP (ms)</span> │ <span class='c-blue'>TLS (ms)</span> │ <span class='c-purple'>TTFB (ms)</span> │ <span class='c-cyan'>Total (ms)</span> │")
    .pasteString("<br>├──────────┼──────────┼──────────┼───────────┼────────────┤")
    .pasteString("<br>│ 18       │ 21       │ 74       │ 39        │ 152        │")
    .pasteString("<br>╰──────────┴──────────┴──────────┴───────────┴────────────╯")
    .pasteString("<br><span class='c-blue'>Average response time:</span> 152ms")
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv jwt inspect ')
    .changeDelay(5)
    .typeString(`eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.${payload64.slice(0, 32)}\n${payload64.slice(32)}.`)
    .changeDelay(75)
    .pasteString("<br><strong><span class='c-blue'>Headers:</span></strong>")
    .pasteString("<br>alg = none")
    .pasteString("<br>typ = JWT")
    .pasteString("<br><strong><span class='c-blue'>Payload (Claims):</span></strong>")
    .pasteString("<br>sub = dev-42<span class='c-gray'>(string type)</span>")
    .pasteString("<br>role = admin<span class='c-gray'>(string type)</span>")
    .pasteString(`<br>exp = ${exp}`)
    .pasteString("<br><span class='c-yellow'>Warning! This token isn't signed, making it unsecure. It shouldn't be used since it could be falsified.</span>")
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv json get exp token-payload.json --file -q')
    .pasteString(`<br><span class='c-lavender'>${exp}</span>`)
    .pauseFor(4000)
    .deleteAll(30)
    .typeString(`dnv time convert ${exp} --to rfc3339 --tz ${tz}`)
    .pasteString(`<br><span class='c-blue'>Input:</span> ${exp} (Unix seconds)`)
    .pasteString(`<br><span class='c-blue'>Timezone:</span> ${tz}`)
    .pasteString(`<br><span class='c-blue'>Result:</span> ${toRFC3339()} (rfc3339)`)
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv crypto hash "release-v1.0.0" --algo sha384')
    .pasteString("<br><strong><span class='c-blue'>'release-v1.0.0' will be hashed using SHA384</span></strong>")
    .pasteString("<br><strong><span class='c-hash'>Hash: 2f57103964277690cd844631ff8e0787866281a941c6bdbb7fc4880a80381673c58a67d\n1fbd671b5346645c3bbb538f4</span></strong>")
    .pauseFor(4000)
    .changeDelay(5)
    .start();

const typewriterQuiet = new Typewriter(terminalQuiet, { loop: true, delay: 75, skipAddStyles: true });
typewriterQuiet
    .pauseFor(1000)
    .typeString('dnv random password --length 10')
    .pasteString("<br><span class='c-green'>Random password: 6ELWyZUUH3</span>")
    .pasteString("<br><br>")
    .typeString('dnv random password --length 10 --quiet | dnv crypto hash --quiet')
    .pasteString("<br>d4c1e17d6a0331dc4e3c221858372ef27efd6fde680718cc8af593c02d9b1c52")
    .pauseFor(4000)
    .deleteAll(30)
    .start();

const commands = {
    "curl": "curl -fsSL https://denev.pages.dev/install.sh | bash",
    "irm": "irm https://denev.pages.dev/install.ps1 | iex",
}

const installPrompt = document.getElementById("hero-install-command").lastElementChild;
    
document.getElementById('hero-install-bar').childNodes.forEach(child => {
    child.addEventListener('click', () => {
        const currentSelect = document.querySelector('.selected');
        if (currentSelect == child) return;
        child.classList.add('selected');
        installPrompt.textContent = '';
        installPrompt.textContent = commands[child.id];
        currentSelect.classList.remove('selected');
        
        
    });
});

const copyIconPath = "<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><g transform='translate(24 0) scale(-1 1)'><rect x='9' y='9' width='11' height='11' rx='2' ry='2'/><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/></g></svg>";
const validIconPath =  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='18' height='18'><circle cx='32' cy='32' r='30' fill='#22C55E'></circle><path d='M18 33L28 43L46 22' fill='none' stroke='#FFFFFF' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'></path></svg>";

document.getElementById('hero-install-command').addEventListener('click', async (event) => {
    const container = event.currentTarget;

    const commandText = container.querySelector('p').innerText;
    const icon = container.querySelector('svg');

    await navigator.clipboard.writeText(commandText);

    icon.outerHTML = validIconPath;

    setTimeout(() => {
        container.querySelector('svg').outerHTML = copyIconPath;
    }, 1000);
    trackCommandCopied(commandText);
});
