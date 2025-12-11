const PARENT_API = "http://localhost:8080/api/parent-projects";
const SUB_API = "http://localhost:8080/api/parent-projects";

const params = new URLSearchParams(window.location.search);
const parentId = params.get("id");

const titleEl = document.getElementById("parent-title");
const customerEl = document.getElementById("parent-customer");
const startEl = document.getElementById("parent-start");
const endEl = document.getElementById("parent-end");
const subCountEl = document.getElementById("sub-count");
const listEl = document.getElementById("subprojects-list");
const emptyEl = document.getElementById("subprojects-empty");

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("da-DK", { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(status) {
    const normalized = (status || "").toUpperCase();
    let color = "bg-gray-700 text-gray-200";
    if (normalized === "CONFIRMED") color = "bg-green-600 text-white";
    else if (normalized === "REQUESTED") color = "bg-blue-600 text-white";
    else if (normalized === "CANCELLED") color = "bg-red-600 text-white";
    return `<span class="text-xs font-semibold px-3 py-1 rounded-full ${color}">${normalized || "-"}</span>`;
}

async function loadParent() {
    if (!parentId) return;
    const resp = await fetch(`${PARENT_API}/${parentId}`);
    if (!resp.ok) {
        titleEl.textContent = "Not found";
        return;
    }
    const p = await resp.json();
    titleEl.textContent = p.name || "Parent project";
    customerEl.textContent = p.customerName || "-";
    startEl.textContent = formatDate(p.startDate);
    endEl.textContent = formatDate(p.endDate);
}

function renderSubprojects(subs) {
    if (!listEl || !emptyEl || !subCountEl) return;
    listEl.innerHTML = "";

    if (!subs.length) {
        emptyEl.classList.remove("hidden");
        subCountEl.textContent = "0";
        return;
    }
    emptyEl.classList.add("hidden");
    subCountEl.textContent = subs.length;

    subs.forEach((sp) => {
        const card = document.createElement("div");
        card.className = "bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2";
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white font-semibold">${sp.name || "Sub project"}</p>
                    <p class="text-xs text-gray-400">${sp.id || ""}</p>
                </div>
                ${statusBadge(sp.status)}
            </div>
            <div class="text-sm text-gray-300 space-y-1">
                <div>Period: ${formatDate(sp.startDate)} – ${formatDate(sp.endDate)}</div>
                <div>Shortages: ${sp.shortages ?? 0}</div>
            </div>
        `;
        listEl.appendChild(card);
    });
}

async function loadSubprojects() {
    if (!parentId) return;
    try {
        const resp = await fetch(`${SUB_API}/${parentId}/sub-projects`);
        if (!resp.ok) {
            console.error("Failed to load sub projects", await resp.text());
            return;
        }
        const subs = await resp.json();
        renderSubprojects(subs);
    } catch (err) {
        console.error("Error loading sub projects", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadParent();
    loadSubprojects();
});
