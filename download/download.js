import { initAnalytics, trackCommandCopied, trackDownload } from '../analytics.js';

initAnalytics();

document.getElementById("linux-x64").addEventListener('click', () => getFile("denev-linux-x86_64.tar.gz", "Linux-x86_64"));
document.getElementById("linux-arm64").addEventListener('click', () => getFile("denev-linux-arm64.tar.gz", "Linux-arm64"));
document.getElementById("mac-x64").addEventListener('click', () => getFile("denev-macos-x86_64.tar.gz", "macOS-x86_64 (Intel)"));
document.getElementById("mac-arm64").addEventListener('click', () => getFile("denev-macos-arm64.tar.gz", "macOS-arm64 (Apple Silicon)"));
document.getElementById("windows-x64").addEventListener('click', () => getFile("denev-windows-x86_64.zip", "Windows-x86_64"));

let hasError = false;

async function getFile(fileName, commonName) {
    try {
        const res = await fetch("https://api.github.com/repos/everwinner64/denev-cli/releases/latest");

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const release = await res.json();
        const tag = release.tag_name.replace('v', '');
        const url = `https://github.com/everwinner64/denev-cli/releases/download/${tag}/${fileName.replace('denev-', `denev-${tag}-`)}`;
        trackDownload(commonName, release.tag_name);

        window.location.href = url;
    } catch (err) {
        if (!hasError) {
            hasError = true;

            const error = document.getElementById("error");
            error.classList.add("spawn")
            document.getElementById("error-param").textContent = `Unable to retrieve files for ${commonName}. (${err})`;

            setTimeout(() => {
                error.classList.remove("spawn");
                error.classList.add("delete");
            }, 5000);
            
            setTimeout(() => {
                hasError = false;
                error.classList.remove("delete");
            }, 6000);
        }
    }
}

const codeSnippets = document.querySelectorAll('pre');

const copyIcon = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(24 0) scale(-1 1)"><rect x="9" y="9" width="11" height="11" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g></svg>`;

const checkIcon = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="18" height="18"><circle cx="32" cy="32" r="30" fill="#22C55E"></circle><path d="M18 33L28 43L46 22" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

codeSnippets.forEach(snippet => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    snippet.parentNode.insertBefore(wrapper, snippet);
    wrapper.appendChild(snippet);

    // L'icône est placée DANS le wrapper mais À CÔTÉ du <pre> (hors scroll)
    wrapper.insertAdjacentHTML('beforeend', `<div class="copy-button">${copyIcon}</div>`);

    wrapper.addEventListener('click', async () => {
        const commandText = snippet.innerText;
        const icon = wrapper.querySelector('.copy-icon');

        await navigator.clipboard.writeText(commandText);

        icon.outerHTML = checkIcon;

        setTimeout(() => {
            wrapper.querySelector('.copy-icon').outerHTML = copyIcon;
        }, 1000);
        trackCommandCopied(commandText);
    });
});