import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cbDir = path.join(root, 'cookbook');
const minCbDir = path.join(root, 'min', 'cookbook');


const md = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(markdownItAttrs);

// ─── Read sources ───────────────────────────────────────


let template = fs.readFileSync(path.join(cbDir, 'cbTemplate.html'), 'utf-8');

// ─── Generation ────────────────────────────────────

console.log(`[build-cookbook] Generating cookbook…`);

const mdContent = fs.readFileSync(path.join(cbDir, 'cookbook.md'), 'utf-8');

const content = md.render(mdContent);

let page = template
    .replace('{{CONTENT}}', content);

fs.mkdirSync(minCbDir, { recursive: true });
fs.writeFileSync(path.join(minCbDir, 'index.html'), page);

console.log(`[build-cookbook] ✓ cookbook/index.html`);

console.log('[build-cookbook] Ready.');
