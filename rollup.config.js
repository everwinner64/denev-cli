import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'cssnano';
import cssnano from 'cssnano'
import copy from 'rollup-plugin-copy';

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

    // tout <link href="/quelconque/chemin.css"> → /css/nom.css
    content = content.replace(
        /(<link[^>]*href\s*=\s*["'])(\/[^"']+\.css)(["'])/gi,
        (match, prefix, cssPath, quote) => {
            const filename = cssPath.split('/').pop(); // juste le nom, ignore le dossier
            return `${prefix}/css/${filename}${quote}`;
        }
    );

    // <script src="..."> : /landing/truc.js  →  /js/truc.min.js
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    content = await replaceAsync(content, scriptRegex, async (match, attrs) => {
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

    // Références JS dans les attributs onclick, etc.
    content = content.replace(/(['"])(?!https?:|\/\/)([^'"]*?)(?<!\.min)\.js\1/g,
        (m, q, p) => {
            const name = p.split('/').pop().replace(/\.js$/i, '');
            return `${q}/js/${name}.min.js${q}`;
        }
    );

    console.log('\x1b[32m[HTML_Path_Update:info]\x1b[0m Updated HTML:', file);
    return content;
}

async function updateCss(cont) {
    let content = cont.toString();
    const result = await postcss([cssnano]).process(content, { from: undefined });
    console.log('\x1b[32m[CSS_Update:info]\x1b[0m Minified a CSS file.');
    return result.css;
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
        src: 'download/*.html',
        dest: 'min/download/',
        rename: 'index.html',
        transform: async (contents, filename) => await updateHtml(contents, filename),
    },
    {
        src: '404.html',
        dest: 'min/',
        transform: async (contents, filename) => await updateHtml(contents, filename),
    },
    {
        src: 'docs/*.css',
        dest: 'min/css/',
        transform: async (contents) => await updateCss(contents),
    },
    {
        src: 'download/*.css',
        dest: 'min/css/',
        transform: async (contents) => await updateCss(contents),
    },
    {
        src: 'landing/*.css',
        dest: 'min/css/',
        transform: async (contents) => await updateCss(contents),
    },
    {
        src: '404.css',
        dest: 'min/css/',
        transform: async (contents) => await updateCss(contents),
    },
    {
        src: 'favicon/*',
        dest: 'min/favicon/',
        onlyFiles: true,
    },
    {
        src: 'images/logo/*',
        dest: 'min/images/',
        onlyFiles: true,
    },
    {
        src: 'images/icons/*',
        dest: 'min/images/',
        onlyFiles: true,
    },
    {
        src: 'install.sh',
        dest: 'min/',
        onlyFiles: true,
    },
    {
        src: '_headers',
        dest: 'min/',
        onlyFiles: true,
    },
    {
        src: 'robots.txt',
        dest: 'min/',
        onlyFiles: true,
    },
];

/* ── Rollup config ─────────────────────────────────── */
export default {
    input: {
        terminal: 'landing/terminal.js',
        docs: 'docs/docs.js',
        download: 'download/download.js',
        404: '404.js'
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
