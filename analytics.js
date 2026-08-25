import posthog from 'posthog-js';

// ── Config partagée ─────────────────────────────────

const PROJECT_KEY = 'phc_nFnUxPEYZ9sXwm24Le5dnXjugGFeVAuz8K8wjhXGVrso';

const INIT_CONFIG = {
    cookieless_mode: 'always',
    autocapture: false,
    capture_pageleave: false,
    person_profiles: 'identified_only',
    api_host: '/a',
    defaults: '2026-05-30',
};

function block() {
    document.querySelectorAll("a, button").forEach(el => {
        if (el.id !== "analytics-alert-hide") {
            el.inert = true;
        }
    });

    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#030719";
}

function unblock() {
    document.querySelectorAll("[inert]").forEach(el => {
        el.inert = false;
    });

    document.body.style.overflow = "";
    document.body.style.backgroundColor = "#040C25";
}

const optOut = document.getElementById("opt-out");
const alert = document.getElementById("analytics-alert");
if (optOut) {
    optOut.addEventListener('click', () => {
        if (localStorage.getItem("hasOptedOut") != "true") {
            posthog.opt_out_capturing();
            localStorage.setItem("hasOptedOut", "true");
            block();

            alert.classList.remove("hidden");
            document.getElementById("analytics-alert-msg").textContent = "Successfully opted out from analytics.";
            document.getElementById("analytics-alert-hide").addEventListener('click', () => {
                alert.classList.add("hidden");
                window.location.reload();
            }, { once: true });
        } else {
            block()
            alert.classList.remove("hidden");
            document.getElementById("analytics-alert-msg").textContent = "You already opted out from analytics.";
            document.getElementById("analytics-alert-hide").addEventListener('click', () => {
                alert.classList.add("hidden"); 
                unblock();
            }, { once: true });
        }
    });
}

// ── Init global ─────────────────────────────────────

export function initAnalytics() {
    if (localStorage.getItem("hasOptedOut") == "true") return;
    posthog.init(PROJECT_KEY, INIT_CONFIG);
    trackLinkClicks();
}

// ── Liens <a data-track> ────────────────────────────

function trackLinkClicks() {
    if (localStorage.getItem("hasOptedOut") == "true") return;
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-track]');
        if (!link) return;

        posthog.capture('link_clicked', {
            url: link.href,
            text: link.textContent.trim().slice(0, 50),
        }, { transport: 'sendBeacon' });
    });
}

// ── Téléchargement ──────────────────────────────────

export function trackDownload(platform, version) {
    if (localStorage.getItem("hasOptedOut") == "true") return;
    posthog.capture('download_clicked', { platform, version }, { transport: 'sendBeacon' });
}

// ── Copie de commande ───────────────────────────────

export function trackCommandCopied(commandText) {
    if (localStorage.getItem("hasOptedOut") == "true") return;
    if (commandText.includes('curl')) {
        posthog.capture('command_copied', { method: 'curl' });
    } else if (commandText.includes('irm')) {
        posthog.capture('command_copied', { method: 'irm' });
    }
}
