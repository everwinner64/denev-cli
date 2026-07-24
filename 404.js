import Typewriter from "typewriter-effect/dist/core";

const terminal = document.getElementById('terminal-output');

const typewriter = new Typewriter(terminal, { loop: true, delay: 75 });

typewriter
    .pauseFor(1000)
    .typeString('dnv http status 404')
    .pasteString("<br><span style='color: #0000FF;'>HTTP Status Code:</span> 404")
    .pasteString("<br><span style='color: #0000FF;'>Name:</span> Not Found")
    .pasteString("<br><span style='color: #0000FF;'>Meaning:</span> The server cannot find the requested resource. The URL may be incorrect or the resource may have been removed.")
    .pasteString("<br><span style='color: #0000FF;'>Usage:</span> Used when the requested resource could not be found on the server.")
    .pauseFor(4000)
    .deleteAll(30)
    .start();