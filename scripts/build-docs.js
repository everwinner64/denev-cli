/**
 * build-docs.js
 *
 * Génère les pages de documentation à partir de :
 *   - docs/template.html           (layout unique)
 *   - docs/versions.json           (liste des versions)
 *   - docs/sidebar.json            (structure de la sidebar)
 *   - docs/<version>/documentation.md  (contenu Markdown par version)
 *
 * La sidebar est construite depuis sidebar.json : chaque entrée référence
 * un {#id} de heading. Si ce heading n'existe pas dans la version courante,
 * l'entrée est ignorée. Une catégorie vide est supprimée.
 *
 * Sortie : min/docs/<version>/index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs');
const minDocsDir = path.join(root, 'min', 'docs');


const md = new MarkdownIt({ html: false, linkify: true, typographer: true }).use(markdownItAttrs);

// ─── Lecture des sources ───────────────────────────────────────
const versions = JSON.parse(fs.readFileSync(path.join(docsDir, 'versions.json'), 'utf-8'));

let template = fs.readFileSync(path.join(docsDir, 'template.html'), 'utf-8');

// ─── Helpers ───────────────────────────────────────────────────

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Génère le HTML de la sidebar.
 */
function renderSidebar(config) {
    let html = '';

    for (const category of config) {
        html += '<div class="sidebar-group">\n';
        html += `<span class="sidebar-category">${escapeHtml(category.label)}</span>\n`;
        html += '<div class="sidebar-children">\n';

        for (const item of category.items) {
            if (item.children && item.children.length > 0) {
                html += '<div class="sidebar-group-toggle">\n';
                html += `<a href="#${item.id}" class="sidebar-link parent">${escapeHtml(item.label)}<span class="chevron"></span></a>\n`;
                html += '<div class="sidebar-subs">\n';
                for (const child of item.children) {
                    html += `<a href="#${child.id}" class="sidebar-link sub">${escapeHtml(child.label)}</a>\n`;
                }
                html += '</div>\n';
                html += '</div>\n';
            } else {
                html += `<a href="#${item.id}" class="sidebar-link">${escapeHtml(item.label)}</a>\n`;
            }
        }

        html += '</div>\n';
        html += '</div>\n';
    }

    return html;
}

/**
 * Génère les <option> du sélecteur de version.
 * La version courante est marquée selected.
 */
function buildVersionSelect(versions, currentId) {
    return versions
        .map(v => {
            const selected = v.id === currentId ? ' selected' : '';
            return `<option value="${v.id}"${selected}>${escapeHtml(v.label)}</option>`;
        })
        .join('\n                    ');
}

// ─── Génération par version ────────────────────────────────────
let idx = 0;
for (const version of versions) {
    const versionDir = path.join(docsDir, version.id);
    const mdPath = path.join(versionDir, 'documentation.md');

    if (!fs.existsSync(mdPath)) {
        console.warn(`[build-docs] documentation.md missing for "${version.id}", skipped.`);
        continue;
    }

    console.log(`[build-docs] Generating docs/${version.id}/ …`);

    const mdContent = fs.readFileSync(mdPath, 'utf-8');

    const sidebarHtml = renderSidebar(JSON.parse(fs.readFileSync(path.join(docsDir, versions[idx]["id"], 'sidebar.json'), 'utf-8')));

    const content = md.render(mdContent);

    const versionSelect = buildVersionSelect(versions, version.id);

    let page = template
        .replace('{{VERSION_SELECT}}', versionSelect)
        .replace('{{SIDEBAR}}', sidebarHtml)
        .replace('{{CONTENT}}', content);


    const outDir = path.join(minDocsDir, version.id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), page);

    console.log(`[build-docs] ✓ docs/${version.id}/index.html`);
    idx++;
}

console.log('[build-docs] Ready.');
