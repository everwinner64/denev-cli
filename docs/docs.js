const sections = document.getElementById('sections');
const burger = document.getElementById('burger-menu');

// ── Toggle sidebar sur mobile ─────────────────────

function updateSectionsTop() {
    const navHeight = document.getElementById('navbar').clientHeight;
    document.getElementById('sections').style.top = `${navHeight}px`;
}

burger.addEventListener('click', () => {
    screen.orientation.addEventListener("change", updateSectionsTop);

    const isOpen = document.body.classList.toggle('sidebar-open');
    const cross = "M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z";
    const burgerPath = "M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z";
    const path = burger.firstElementChild;
    path.setAttribute('d', isOpen ? cross : burgerPath);
    burger.classList.toggle('closed', !isOpen);
    burger.classList.toggle('oppened', isOpen);

    updateSectionsTop();
});

// ── Fermer la sidebar au clic sur un lien ─────────

sections.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link || e.target.classList.contains('chevron')) return;

    document.body.classList.remove('sidebar-open');
    const path = burger.firstElementChild;
    path.setAttribute('d', "M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z");
    burger.classList.add('closed');
    burger.classList.remove('oppened');
});

// ── Toggle sous-sections (chevrons) ────────────────

sections.addEventListener('click', (e) => {
    const parent = e.target.closest('.sidebar-link.parent');
    if (!parent) return;

    const subs = parent.nextElementSibling;

    // Si clic sur le chevron, ne pas suivre le lien
    if (e.target.classList.contains('chevron')) {
        e.preventDefault();
        const isOpen = subs.classList.toggle('open');
        parent.setAttribute('aria-expanded', isOpen);
    }

    if (!subs || !subs.classList.contains('sidebar-subs')) return;
});

// ── Version selection ────────────────

document.getElementById('version').addEventListener('change', (event) => {
    window.location.href = `/docs/${event.target.value}/`;
});

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
    });
});