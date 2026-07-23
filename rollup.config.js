import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import { JSDOM } from 'jsdom';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

/* ── Helper: async string.replace ───────────────────── */
async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        promises.push(asyncFn(match, ...args));
        return match;
    });
    const resolved = await Promise.all(promises);
    let i = 0;
    return str.replace(regex, () => resolved[i++]);
}

/* ── Transform: rewrite resource paths in HTML ─────── */
async function updateHtml(cont, file) {
    let content = cont.toString();

    // 1. CSS: /landing/foo.css  ou  /css/foo.css  →  /css/foo.css
    content = content.replace(
        /(<link[^>]*href\s*=\s*["'])\/(?:landing\/|css\/)([^"']+\.css)(["'])/gi,
        (match, prefix, cssPath, quote) => {
            const filename = cssPath.split('/').pop(); // juste le nom, ignore le dossier
            return `${prefix}/css/${filename}${quote}`;
        }
    );

    // 2. JS <script src="..."> : /landing/truc.js  →  /js/truc.min.js
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    content = await replaceAsync(content, scriptRegex, async (match, attrs, cde) => {
        const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
        if (srcMatch) {
            const src = srcMatch[1];
            if (/^(https?:)?\/\//i.test(src)) return match; // laisser les URL externes

            const name = src.split('/').pop().replace(/\.js$/i, '');
            const newSrc = `/js/${name}.min.js`;
            return match.replace(srcMatch[1], newSrc);
        }
        return match; // laisser les scripts inline tels quels
    });

    // 3. Références JS dans les attributs onclick, etc.
    content = content.replace(/(['"])(?!https?:|\/\/)([^'"]*?)(?<!\.min)\.js\1/g,
        (m, q, p) => {
            const name = p.split('/').pop().replace(/\.js$/i, '');
            return `${q}/js/${name}.min.js${q}`;
        }
    );

    console.log('\x1b[32m[HTML_Path_Update:info]\x1b[0m Updated HTML:', file);
    return content;
}

async function markdownToHtml(cont, file) {
    cont = await updateHtml(cont, file)
    const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true }).use(markdownItAttrs);

    const content = fs.readFileSync(path.join(path.dirname(file), 'docs', 'documentation.md'), 'utf-8');

    const tempDom = new JSDOM(cont);
    tempDom.window.document.getElementById("documentation").innerHTML += (markdown.render(content));
    return tempDom.serialize();
}

/* ── Copy targets ──────────────────────────────────── */
const targets = [
    {
        // HTML : garde son dossier d'origine sous min/
        // landing/home.html → min/index.html
        src: 'landing/*.html',
        dest: 'min/',
        rename: 'index.html',
        transform: async (contents, filename) => await updateHtml(contents, filename),
    },
    {
        src: 'docs/*.html',
        dest: 'min/docs/',
        rename: 'index.html',
        transform: async (contents, filename) => await markdownToHtml(contents, filename),
    },
    {
        src: 'docs/*.css',
        dest: 'min/css/',
    },
    {
        // CSS : regroupé dans min/css/
        // landing/home.css → min/css/home.css
        src: 'landing/*.css',
        dest: 'min/css/',
    },
    {
        // Favicon : copié à l'identique sous min/
        // favicon/favicon-16x16.png → min/favicon/favicon-16x16.png
        src: 'favicon/*',
        dest: 'min/favicon/',
        onlyFiles: true,
    },
    {
        // Images : préserve l'arborescence
        // images/logo/denev.png → min/images/logo/denev.png
        src: 'images/**',
        dest: 'min/images/',
        onlyFiles: true,
    },
    {
        src: 'install.sh',
        dest: 'min/',
        onlyFiles: true,
    },
];

/* ── Rollup config ─────────────────────────────────── */
export default {
    input: {
        terminal: 'landing/terminal.js',
        docs: 'docs/docs.js'
    },

    output: {
        dir: 'min',
        format: 'es',
        sourcemap: false,

        // Tous les .js dans un dossier js/ avec extension .min.js
        entryFileNames: 'js/[name].min.js',
        chunkFileNames: 'js/[name].min.js',

        // Sépare le code vendor (node_modules) du code applicatif
        manualChunks(id) {
            if (id.includes('node_modules')) {
                return 'vendor';
            }
        },
    },

    plugins: [
        commonjs(),
        resolve({ preferBuiltins: true }),
        terser(),
        copy({ targets, flatten: false }),
    ],
};
