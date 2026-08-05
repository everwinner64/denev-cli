export async function onRequest({ request }) {
    const url = new URL(request.url);

    const target = new URL(
        "https://eu.i.posthog.com" +
        url.pathname.replace(/^\/a/, "")
    );

    target.search = url.search;

    const response = await fetch(new Request(target, request));

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}