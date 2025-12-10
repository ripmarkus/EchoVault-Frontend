const API_BASE = "http://localhost:8080/api/customers";
const CONTACT_API = "http://localhost:8080/api/contacts";

let allContacts = [];
let linkedContacts = [];
let contactTab = "all"; // "all" or "linked"
let contactSearchQuery = "";

// DEMO DATA FOR PERFORMANCE
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

// -----------------------------
// INLINE EDIT HANDLER
// -----------------------------
document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-edit-field]");
    if (!btn) return;

    const field = btn.dataset.editField;
    const valueEl = document.getElementById(
        "detail-" + field.replace("addressLine", "address")
    );

    const oldValue = valueEl.textContent.trim();
    const input = document.createElement("input");
    input.value = oldValue;
    input.className =
        "px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full";

    valueEl.replaceWith(input);
    input.focus();

    async function save() {
        const newValue = input.value.trim();

        await fetch(`${API_BASE}/${customerId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: newValue })
        });

        await loadCustomer();
    }

    input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") save();
    });

    input.addEventListener("blur", save);
});

// ----------------------
// CHARTS & METRICS
// ----------------------
function renderRevenueTrend() {
    const canvas = document.getElementById("revenue-line-chart");
    if (!canvas) return;

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
    if (!canvas) return;

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

// ----------------------
// INVOICES
// ----------------------
function renderInvoices(invoices) {
    const container = document.getElementById("invoice-grid");
    container.innerHTML = "";

    if (!invoices || !invoices.length) {
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

// ----------------------
// CONTACTS – SIDEBAR (2 + "x more")
// ----------------------
function renderLinkedContacts(contacts) {
    const container = document.getElementById("contacts-list");
    container.innerHTML = "";

    if (!contacts || contacts.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No contacts linked.</p>`;
        return;
    }

    const toShow = contacts.slice(0, 2);

    toShow.forEach(c => {
        const div = document.createElement("div");
        div.className = "p-3 bg-gray-800 rounded-lg border border-gray-700";

        div.innerHTML = `
            <p class="font-semibold">${c.name}</p>
            <p class="text-sm text-gray-400">${c.email ?? "-"}</p>
            <p class="text-sm text-gray-400">${c.phone ?? "-"}</p>
        `;
        container.appendChild(div);
    });

    if (contacts.length > 2) {
        const remaining = contacts.length - 2;

        const moreDiv = document.createElement("div");
        moreDiv.className = "text-blue-300 text-sm cursor-pointer underline";
        moreDiv.textContent = `+ ${remaining} more`;

        moreDiv.addEventListener("click", () => {
            document.getElementById("open-contact-modal-btn").click();
        });

        container.appendChild(moreDiv);
    }
}

// ----------------------
// CONTACT MODAL – LIST
// ----------------------
function renderContactList() {
    const container = document.getElementById("contact-list");
    container.innerHTML = "";

    let filtered = contactTab === "all"
        ? allContacts
        : allContacts.filter(c => linkedContacts.includes(c.id));

    if (contactSearchQuery.trim() !== "") {
        const q = contactSearchQuery.toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.email ?? "").toLowerCase().includes(q)
        );
    }

    if (!filtered.length) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No contacts found.</p>`;
        return;
    }

    filtered.forEach(c => {
        const div = document.createElement("label");
        div.className =
            "flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700";

        div.innerHTML = `
            <input type="checkbox" value="${c.id}"
                ${linkedContacts.includes(c.id) ? "checked" : ""}/>
            <span>${c.name}
                <span class="text-gray-400 text-sm">(${c.email ?? "-"})</span>
            </span>
        `;

        container.appendChild(div);
    });
}

function highlightContactTab() {
    const tabAll = document.getElementById("contact-tab-all");
    const tabLinked = document.getElementById("contact-tab-linked");

    if (contactTab === "all") {
        tabAll.className = "px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold";
        tabLinked.className = "px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600";
    } else {
        tabLinked.className = "px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold";
        tabAll.className = "px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600";
    }
}

function closeContactModal() {
    const modal = document.getElementById("contact-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// ----------------------
// CONTACT MODAL – OPEN / SAVE / CREATE
// ----------------------
async function openContactModal() {
    const modal = document.getElementById("contact-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // 1. Load all contacts
    const allResp = await fetch(CONTACT_API);
    allContacts = await allResp.json();

    // 2. Load customer to get linked contacts
    const custResp = await fetch(`${API_BASE}/${customerId}`);
    const customer = await custResp.json();
    linkedContacts = (customer.contacts ?? []).map(c => c.id);

    contactTab = "all";
    highlightContactTab();
    renderContactList();
}

async function saveContacts() {
    const checkboxes = Array.from(
        document.querySelectorAll("#contact-list input[type='checkbox']")
    );

    linkedContacts = checkboxes
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));

    await fetch(`${API_BASE}/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: linkedContacts })
    });

    closeContactModal();
    await loadCustomer();
}

async function createNewContact() {
    const name = document.getElementById("new-contact-name").value.trim();
    const email = document.getElementById("new-contact-email").value.trim();
    const phone = document.getElementById("new-contact-phone").value.trim();

    if (!name) {
        alert("Name is required");
        return;
    }

    const resp = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone })
    });

    if (!resp.ok) {
        console.error(await resp.text());
        alert("Failed to create contact");
        return;
    }

    const created = await resp.json();

    // Update in-memory
    allContacts.push(created);
    if (!linkedContacts.includes(created.id)) {
        linkedContacts.push(created.id);
    }

    // Persist link to customer
    await fetch(`${API_BASE}/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: linkedContacts })
    });

    // Clear inputs
    document.getElementById("new-contact-name").value = "";
    document.getElementById("new-contact-email").value = "";
    document.getElementById("new-contact-phone").value = "";

    // Refresh lists
    renderContactList();
    await loadCustomer();
}

// ----------------------
// ARTISTS (children)
// ----------------------
async function loadArtists(artistIds) {
    const container = document.getElementById("artists-list");
    container.innerHTML = "";

    if (!artistIds || !artistIds.length) {
        container.innerHTML = `<p class="text-gray-400 text-sm">No associated artists.</p>`;
        return;
    }

    const artistPromises = artistIds.map(id =>
        fetch(`${API_BASE}/${id}`).then(r => r.json())
    );

    const artists = await Promise.all(artistPromises);

    artists.forEach(a => {
        const div = document.createElement("div");
        div.className = "bg-gray-800 p-3 rounded-lg border border-gray-700";

        div.innerHTML = `
            <p class="font-semibold">${a.name}</p>
            <p class="text-gray-400 text-sm">${a.email ?? "-"}</p>
        `;
        container.appendChild(div);
    });
}

// ----------------------
// LOAD CUSTOMER
// ----------------------
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

    // Contacts in sidebar (only first 2 + "x more")
    renderLinkedContacts(c.contacts ?? []);

    // Artists: show only if this is a bureau (no parent)
    const artistsSection = document.getElementById("artists-section");
    if (!c.parentId) {
        artistsSection.classList.remove("hidden");
        await loadArtists(c.children ?? []);
    } else {
        artistsSection.classList.add("hidden");
    }
}

// ----------------------
// INIT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    // Contact modal UI wiring
    document.getElementById("contact-tab-all").addEventListener("click", () => {
        contactTab = "all";
        highlightContactTab();
        renderContactList();
    });

    document.getElementById("contact-tab-linked").addEventListener("click", () => {
        contactTab = "linked";
        highlightContactTab();
        renderContactList();
    });

    document.getElementById("contact-search").addEventListener("input", (e) => {
        contactSearchQuery = e.target.value;
        renderContactList();
    });

    document.getElementById("open-contact-modal-btn").addEventListener("click", () => {
        openContactModal();
    });

    document.getElementById("contact-modal-close").addEventListener("click", closeContactModal);
    document.getElementById("contact-save-btn").addEventListener("click", saveContacts);

    document.getElementById("contact-modal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeContactModal();
    });

    document.getElementById("create-contact-btn").addEventListener("click", createNewContact);

    // Initial loads
    loadCustomer();
    loadInvoices();
    renderPerformanceMetrics();
    renderPerformanceChart();
    renderRevenueTrend();
});
