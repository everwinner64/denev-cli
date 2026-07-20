import Typewriter from "typewriter-effect/dist/core";

const terminal = document.getElementById('terminal-output');
const terminalQuiet = document.getElementById('terminal-output-quiet');

const typewriter = new Typewriter(terminal, { loop: true, delay: 75 });
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

typewriter
    .pauseFor(1000)
    .typeString('dnv http timing api.example.com')
    .pasteString("<br>╭──────────┬──────────┬──────────┬───────────┬────────────╮")
    .pasteString("<br>│ <span style='color: #008000;'>DNS (ms)</span> │ <span style='color: #FFFF00;'>TCP (ms)</span> │ <span style='color: #0000FF;'>TLS (ms)</span> │ <span style='color: #800080;'>TTFB (ms)</span> │ <span style='color: #00FFFF;'>Total (ms)</span> │")
    .pasteString("<br>├──────────┼──────────┼──────────┼───────────┼────────────┤")
    .pasteString("<br>│ 18       │ 21       │ 74       │ 39        │ 152        │")
    .pasteString("<br>╰──────────┴──────────┴──────────┴───────────┴────────────╯")
    .pasteString("<br><span style='color: #0000FF;'>Average response time:</span> 152ms")
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv jwt inspect ')
    .changeDelay(5)
    .typeString('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZXYtNDIiLCJyb2xlIjoi\nYWRtaW4iLCJleHAiOjE3ODQ1NjMyMDB9.')
    .changeDelay(75)
    .pasteString("<br><strong><span style='color: #0000FF;'>Headers:</span></strong>")
    .pasteString("<br>alg = none")
    .pasteString("<br>typ = JWT")
    .pasteString("<br><strong><span style='color: #0000FF;'>Payload (Claims):</span></strong>")
    .pasteString("<br>sub = dev-42<span style='color: #444444;'>(string type)</span>")
    .pasteString("<br>role = admin<span style='color: #444444;'>(string type)</span>")
    .pasteString("<br>exp = 1784563200")
    .pasteString("<br><span style='color: #FFFF00;'>Warning! This token isn't signed, making it unsecure. It shouldn't be used since it could be falsified.</span>")
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv json get exp token-payload.json --file -q')
    .pasteString("<br><span style='color: #BB86FC;'>1784563200</span>")
    .pauseFor(4000)
    .deleteAll(30)
    .typeString(`dnv time convert 1784563200 --to rfc3339 --tz ${tz}`)
    .pasteString("<br><span style='color: #0000FF;'>Input:</span> 1784563200 (Unix seconds)")
    .pasteString(`<br><span style='color: #0000FF;'>Timezone:</span> ${tz}`)
    .pasteString(`<br><span style='color: #0000FF;'>Result:</span> ${toRFC3339()} (rfc3339)`)
    .pauseFor(4000)
    .deleteAll(30)
    .typeString('dnv crypto hash "release-v1.0.0" --algo sha384')
    .pasteString("<br><strong><span style='color: #0000FF;'>'release-v1.0.0' will be hashed using SHA384</span></strong>")
    .pasteString("<br><strong><span style='color: #00D700;'>Hash: 2f57103964277690cd844631ff8e0787866281a941c6bdbb7fc4880a80381673c58a67d\n1fbd671b5346645c3bbb538f4</span></strong>")
    .pauseFor(4000)
    .changeDelay(5)
    .start();

const typewriterQuiet = new Typewriter(terminalQuiet, { loop: true, delay: 75 });
typewriterQuiet
    .pauseFor(1000)
    .typeString('dnv random password --length 10')
    .pasteString("<br><span style='color: #008000;'>Random password: 6ELWyZUUH3</span>")
    .pasteString("<br><br>")
    .typeString('dnv random password --length 10 --quiet | dnv crypto hash --quiet')
    .pasteString("<br>d4c1e17d6a0331dc4e3c221858372ef27efd6fde680718cc8af593c02d9b1c52")
    .pauseFor(4000)
    .deleteAll(30)
    .start()
    
    