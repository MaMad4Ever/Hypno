const endpoints = new Set();
const parameters = new Set();

document.querySelectorAll("a[href]").forEach(link => {
    try {
        const url = new URL(link.href, location.href);

        if (url.protocol === "http:" || url.protocol === "https:") {
            endpoints.add(url.href);
        }
    } catch {
        // Ignore invalid URLs
    }
});

document.querySelectorAll("script[src]").forEach(script => {
    try {
        const url = new URL(script.src, location.href);
        endpoints.add(url.href);
    } catch {
        // Ignore invalid URLs
    }
});

document.querySelectorAll("a[href]").forEach(link => {
    try {
        const url = new URL(link.href, location.href);

        url.searchParams.forEach((value, name) => {
            parameters.add(name);
        });
    } catch {
        // Ignore invalid URLs
    }
});

document.querySelectorAll("input").forEach(input => {
    const name = input.getAttribute("name");
    const id = input.getAttribute("id");

    if (name) {
        parameters.add(name);
    }

    if (id) {
        parameters.add(id);
    }
});

document.querySelectorAll("script").forEach(script => {
    const code = script.textContent;

    const matches = code.match(
        /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g
    );

    if (!matches) {
        return;
    }

    matches.forEach(match => {
        const variable = match
            .replace(/^\s*(const|let|var)\s+/, "");

        parameters.add(variable);
    });
});

function extractJsonKeys(data) {
    if (!data || typeof data !== "object") {
        return;
    }

    Object.entries(data).forEach(([key, value]) => {
        parameters.add(key);

        if (value && typeof value === "object") {
            extractJsonKeys(value);
        }
    });
}

document.querySelectorAll("script").forEach(script => {
    const type = script.getAttribute("type");

    if (type !== "application/json") {
        return;
    }

    try {
        const data = JSON.parse(script.textContent);
        extractJsonKeys(data);
    } catch {
        // Ignore invalid JSON
    }
});

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "getReconData") {
        return Promise.resolve({
            endpoints: [...endpoints],
            parameters: [...parameters]
        });
    }
});