import Typewriter from "typewriter-effect/dist/core";

const terminal = document.getElementById('terminal-output');

const typewriter = new Typewriter(terminal, { loop: true, delay: 75, skipAddStyles: true });

typewriter
    .pauseFor(1000)
    .typeString('dnv http status 404')
    .pasteString("<br><span class='c-blue'>HTTP Status Code:</span> 404")
    .pasteString("<br><span class='c-blue'>Name:</span> Not Found")
    .pasteString("<br><span class='c-blue'>Meaning:</span> The server cannot find the requested resource. The URL may be incorrect or the resource may have been removed.")
    .pasteString("<br><span class='c-blue'>Usage:</span> Used when the requested resource could not be found on the server.")
    .pauseFor(4000)
    .deleteAll(30)
    .start();