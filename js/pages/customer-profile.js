const API_BASE = "http://localhost:8080/api/customers";

const DEMO_PERFORMANCE = {
    ordersFulfilled: 128,
    avgTurnaround: "4.2 days",
    revenuePercent: 72,
    artistRevenue: [
        { name: "Aurora Echo", value: 45 },
        { name: "Midnight Tempo", value: 30 },
        { name: "Silverline", value: 25 }
    ]
};

const DEMO_REVENUE = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [4200, 7500, 9200, 6100, 8800, 10400] // DKK
};


// Extract ID from URL: customer-profile.html?id=cust-5
const params = new URLSearchParams(window.location.search);
const customerId = params.get("id");

if (!customerId) {
    console.error("Missing ?id=cust-X");
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-edit-field]");
    if (!btn) return;

    const field = btn.dataset.editField;
    const valueEl = document.getElementById("detail-" + field.replace("addressLine", "address"));

    // Create input
    const oldValue = valueEl.textContent.trim();
    const input = document.createElement("input");
    input.value = oldValue;
    input.className =
        "px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full";

    // Replace text with input
    valueEl.replaceWith(input);
    input.focus();

    // Save on Enter or blur
    async function save() {
        const newValue = input.value.trim();

        await fetch(`${API_BASE}/${customerId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: newValue })
        });

        // Reload customer info
        await loadCustomer();
    }

    input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") save();
    });

    input.addEventListener("blur", save);
});


// ----------------------
// RENDER REVENUE TREND CHART
// ----------------------
function renderRevenueTrend() {
    const canvas = document.getElementById("revenue-line-chart");
    if (!canvas) return;

    // Destroy old chart if re-rendered
    if (window.revenueChart) {
        window.revenueChart.destroy();
    }

    window.revenueChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: DEMO_REVENUE.labels,
            datasets: [{
                label: "Revenue (DKK)",
                data: DEMO_REVENUE.values,
                borderColor: "#4A90E2",
                backgroundColor: "rgba(74, 144, 226, 0.2)",
                borderWidth: 2,
                tension: 0.35,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#4A90E2"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "#fff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#ccc" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    ticks: { color: "#ccc" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                }
            }
        }
    });
}

function renderPerformanceMetrics() {
    document.getElementById("metric-orders").textContent = DEMO_PERFORMANCE.ordersFulfilled;
    document.getElementById("metric-turnaround").textContent = DEMO_PERFORMANCE.avgTurnaround;
    document.getElementById("metric-revenue").textContent = `${DEMO_PERFORMANCE.revenuePercent}%`;
}

function renderPerformanceChart() {
    const canvas = document.getElementById("artist-pie-chart");

    // Destroy existing chart if it exists (prevents duplication on reload)
    if (window.artistChart) {
        window.artistChart.destroy();
    }

    window.artistChart = new Chart(canvas, {
        type: "pie",
        data: {
            labels: DEMO_PERFORMANCE.artistRevenue.map(a => a.name),
            datasets: [{
                data: DEMO_PERFORMANCE.artistRevenue.map(a => a.value),
                backgroundColor: ["#4A90E2", "#50E3C2", "#B8E986"]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: { color: "#fff" }
                }
            }
        }
    });
}


function renderInvoices(invoices) {
    const container = document.getElementById("invoice-grid");
    container.innerHTML = "";

    if (!invoices.length) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No invoices available.</p>`;
        return;
    }

    invoices.forEach(inv => {
        const el = document.createElement("div");
        el.className = "bg-gray-800 px-4 py-3 rounded-lg border border-gray-700";

        el.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold">${inv.invoiceNumber}</p>
                    <p class="text-gray-400 text-sm">${inv.invoiceDate} → ${inv.dueDate}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold">${inv.amount} ${inv.currency}</p>
                    <p class="text-sm ${
            inv.status === "PAID" ? "text-green-400" :
                inv.status === "OVERDUE" ? "text-red-400" :
                    "text-blue-400"
        }">${inv.status}</p>
                </div>
            </div>
        `;
        container.appendChild(el);
    });
}



// Load customer and fill UI
async function loadCustomer() {
    const resp = await fetch(`${API_BASE}/${customerId}`);
    if (!resp.ok) {
        console.error("Could not load", await resp.text());
        return;
    }

    const c = await resp.json();

    // Top title
    document.getElementById("customer-name-title").textContent = c.name;

    // Detail section
    document.getElementById("detail-name").textContent = c.name;
    document.getElementById("detail-cvr").textContent = c.cvr ?? "-";
    document.getElementById("detail-phone").textContent = c.phone ?? "-";
    document.getElementById("detail-email").textContent = c.email ?? "-";
    document.getElementById("detail-address").textContent = c.addressLine ?? "-";
    document.getElementById("detail-postalCode").textContent = c.postalCode ?? "-";
}
async function loadInvoices() {
    try {
        const resp = await fetch(`http://localhost:8080/api/invoices/customer/${customerId}`);
        if (!resp.ok) {
            console.error("Failed to load invoices:", await resp.text());
            return;
        }

        const invoices = await resp.json();
        renderInvoices(invoices);

    } catch (err) {
        console.error("Error fetching invoices:", err);
    }
}


loadCustomer();
loadInvoices();
renderPerformanceMetrics();
renderPerformanceChart();
renderRevenueTrend();