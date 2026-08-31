import { initAnalytics, trackCommandCopied } from '../analytics.js';

initAnalytics();

const codeSnippets = document.querySelectorAll('pre');

const copyIcon = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(24 0) scale(-1 1)"><rect x="9" y="9" width="11" height="11" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g></svg>`;

const checkIcon = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="18" height="18"><circle cx="32" cy="32" r="30" fill="#22C55E"></circle><path d="M18 33L28 43L46 22" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

codeSnippets.forEach(snippet => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    snippet.parentNode.insertBefore(wrapper, snippet);
    wrapper.appendChild(snippet);

    // Icon is placed INSIDE the wrapper but NEXT TO the <pre> (outside scroll)
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