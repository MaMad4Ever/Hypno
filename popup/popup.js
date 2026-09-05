const scanBtn = document.getElementById("scanBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const exportBtn = document.getElementById("exportBtn");
const results = document.getElementById("results");
const count = document.getElementById("count");

let currentEndpoints = [];
let currentParameters = [];
let activeTab = "endpoints";

scanBtn.addEventListener("click", async () => {
    results.innerHTML = "<p class='empty'>Scanning...</p>";

    try {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true
        });

        const response = await browser.tabs.sendMessage(
            tabs[0].id,
            {
                action: "getReconData"
            }
        );

        currentEndpoints = [...new Set(response.endpoints)];
        currentParameters = [...new Set(response.parameters)];

        if (activeTab === "endpoints") {
            displayEndpoints(currentEndpoints);
        } else if (activeTab === "parameters") {
            displayParameters(currentParameters);
        }

    } catch (error) {
        results.innerHTML =
            `<p class="empty">Error: ${error.message}</p>`;
    }
});

copyAllBtn.addEventListener("click", async () => {
    if (!currentEndpoints.length) {
        return;
    }

    await navigator.clipboard.writeText(
        currentEndpoints.join("\n")
    );

    copyAllBtn.textContent = "Copied!";

    setTimeout(() => {
        copyAllBtn.textContent = "Copy All";
    }, 1500);
});

exportBtn.addEventListener("click", () => {
    const data = activeTab === "endpoints"
        ? currentEndpoints
        : currentParameters;

    if (!data.length) {
        return;
    }

    const blob = new Blob(
        [data.join("\n")],
        { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `hypno-${activeTab}.txt`;

    link.click();

    URL.revokeObjectURL(url);
});

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        activeTab = tab.dataset.tab;

        document.querySelectorAll(".tab").forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        if (activeTab === "endpoints") {
            displayEndpoints(currentEndpoints);
        } else {
            displayParameters(currentParameters);
        }
    });
});
function displayParameters(parameters) {
    count.textContent = `Parameters: ${parameters.length}`;

    if (!parameters.length) {
        results.innerHTML =
            "<p class='empty'>No parameters found.</p>";
        return;
    }

    results.innerHTML = "";

    parameters.forEach(parameter => {
        const item = document.createElement("div");

        item.textContent = parameter;
        item.className = "endpoint";

        results.appendChild(item);
    });
}

function displayEndpoints(endpoints) {
    count.textContent = `Endpoints: ${endpoints.length}`;

    if (!endpoints.length) {
        results.innerHTML =
            "<p class='empty'>No endpoints found.</p>";
        return;
    }

    results.innerHTML = "";

    endpoints.forEach(endpoint => {
        const item = document.createElement("div");

        item.textContent = endpoint;
        item.className = "endpoint";

        results.appendChild(item);
    });
}