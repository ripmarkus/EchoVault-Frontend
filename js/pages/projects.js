const API_BASE = "http://localhost:8080/api/parent-projects";
const CUSTOMERS_API_BASE = "http://localhost:8080/api/customers";

let projectsCache = [];
let customersCache = [];

const tableBody = document.getElementById("projects-table-body");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const refreshBtn = document.getElementById("refresh-projects");
const createBtn = document.getElementById("create-project-btn");

const modal = document.getElementById("project-modal");
const modalClose = document.getElementById("project-modal-close");
const modalTitle = document.getElementById("project-modal-title");
const modalContent = document.getElementById("project-modal-content");

const formModal = document.getElementById("project-form-modal");
const formModalClose = document.getElementById("project-form-close");
const formModalCancel = document.getElementById("project-form-cancel");
const form = document.getElementById("project-form");
const formTitle = document.getElementById("project-form-title");
const formMode = document.getElementById("project-form-mode");
const formId = document.getElementById("project-form-id");
const formName = document.getElementById("form-name");
const formStatus = document.getElementById("form-status");
const formCustomer = document.getElementById("form-customerId");
const formShortages = document.getElementById("form-shortages");
const formStart = document.getElementById("form-startDate");
const formEnd = document.getElementById("form-endDate");

const totalEl = document.getElementById("projects-total");
const confirmedEl = document.getElementById("projects-confirmed");
const requestedEl = document.getElementById("projects-requested");

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("da-DK", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatPeriod(start, end) {
    const startText = formatDate(start);
    const endText = formatDate(end);
    if (!start && !end) return "-";
    if (start && !end) return `${startText}  ?`;
    if (!start && end) return `?  ${endText}`;
    return `${startText}  ${endText}`;
}

function statusBadge(status) {
    const normalized = (status || "").toUpperCase();
    let color = "bg-gray-700 text-gray-200";
    if (normalized === "CONFIRMED") color = "bg-green-600 text-white";
    else if (normalized === "REQUESTED") color = "bg-blue-600 text-white";
    else if (normalized === "CANCELLED") color = "bg-red-600 text-white";

    return `<span class="text-xs font-semibold px-3 py-1 rounded-full ${color}">${normalized || "UNKNOWN"}</span>`;
}

function updateStats(projects) {
    totalEl.textContent = projects.length;
    confirmedEl.textContent = projects.filter((p) => p.status === "CONFIRMED").length;
    requestedEl.textContent = projects.filter((p) => p.status === "REQUESTED").length;
}

function renderProjects(projects) {
    tableBody.innerHTML = "";

    if (!projects.length) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="p-6 text-center text-gray-400">No projects found.</td>
          </tr>
        `;
        updateStats([]);
        return;
    }

    projects.forEach((project) => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-700 hover:bg-gray-700/60 transition-colors";
        row.innerHTML = `
            <td class="p-6">
              <div class="flex flex-col">
                <span class="text-white font-semibold">${project.name || "Unnamed project"}</span>
                <span class="text-xs text-gray-400">${project.id || ""}</span>
              </div>
            </td>
            <td class="p-6">
              <div class="flex flex-col">
                <span class="text-white">${project.customerName || "Unknown customer"}</span>
                ${project.customerId ? `<span class="text-xs text-gray-400">${project.customerId}</span>` : ""}
              </div>
            </td>
            <td class="p-6">${statusBadge(project.status)}</td>
            <td class="p-6 text-gray-200">${formatPeriod(project.startDate, project.endDate)}</td>
            <td class="p-6 text-gray-200">${project.shortages ?? 0}</td>
            <td class="p-6">
              <div class="flex gap-2">
                <button
                  class="open-parent px-3 py-1 text-xs rounded bg-[#55A5F8] hover:bg-[#3F8CE0] text-white"
                  data-project-id="${project.id}"
                >
                  Open
                </button>
                <button
                  class="edit-project px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white"
                  data-project-id="${project.id}"
                >
                  Edit
                </button>
                <button
                  class="delete-project px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
                  data-project-id="${project.id}"
                >
                  Delete
                </button>
              </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateStats(projects);
}

async function loadProjects(query = "") {
    try {
        const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        projectsCache = data;
        renderProjects(data);
    } catch (err) {
        console.error("Failed to load projects", err);
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="p-6 text-center text-red-300">Could not load projects. See console for details.</td>
          </tr>
        `;
        updateStats([]);
    }
}

async function loadCustomers() {
    try {
        const resp = await fetch(CUSTOMERS_API_BASE);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        customersCache = await resp.json();
    } catch (err) {
        console.error("Failed to load customers", err);
        customersCache = [];
    }
    populateCustomerDropdown();
}

function populateCustomerDropdown(selectedId = null) {
    if (!formCustomer) return;
    formCustomer.innerHTML = "";

    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "Select customer";
    formCustomer.appendChild(noneOpt);

    customersCache.forEach((cust) => {
        const opt = document.createElement("option");
        opt.value = cust.id;
        opt.textContent = cust.name;
        if (selectedId && selectedId === cust.id) opt.selected = true;
        formCustomer.appendChild(opt);
    });
}

async function openProjectModal(projectId) {
    if (!projectId) return;
    try {
        const resp = await fetch(`${API_BASE}/${projectId}`);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();

        modalTitle.textContent = data.name || "Project";
        modalContent.innerHTML = `
          <div><span class="font-semibold">ID:</span> ${data.id ?? "-"}</div>
          <div><span class="font-semibold">Customer:</span> ${data.customerName ?? "-"}</div>
          <div><span class="font-semibold">Customer ID:</span> ${data.customerId ?? "-"}</div>
          <div><span class="font-semibold">Status:</span> ${data.status ?? "-"}</div>
          <div><span class="font-semibold">Shortages:</span> ${data.shortages ?? 0}</div>
          <div><span class="font-semibold">Start date:</span> ${formatDate(data.startDate)}</div>
          <div><span class="font-semibold">End date:</span> ${formatDate(data.endDate)}</div>
        `;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } catch (err) {
        console.error("Failed to load project details", err);
        modalTitle.textContent = "Error";
        modalContent.innerHTML = `<div class="text-red-300 text-sm">Could not load project details.</div>`;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

async function openFormForCreate() {
    formMode.value = "create";
    formId.value = "";
    formTitle.textContent = "New project";

    formName.value = "";
    formStatus.value = "REQUESTED";
    formShortages.value = 0;
    formStart.value = "";
    formEnd.value = "";

    populateCustomerDropdown(null);

    formModal.classList.remove("hidden");
    formModal.classList.add("flex");
}

async function openFormForEdit(projectId) {
    if (!projectId) return;
    try {
        const resp = await fetch(`${API_BASE}/${projectId}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        formMode.value = "edit";
        formId.value = data.id;
        formTitle.textContent = "Edit project";

        formName.value = data.name || "";
        formStatus.value = data.status || "REQUESTED";
        formShortages.value = data.shortages ?? 0;
        formStart.value = data.startDate || "";
        formEnd.value = data.endDate || "";

        populateCustomerDropdown(data.customerId || "");

        formModal.classList.remove("hidden");
        formModal.classList.add("flex");
    } catch (err) {
        console.error("Failed to load project for edit", err);
    }
}

function closeFormModal() {
    if (!formModal) return;
    formModal.classList.add("hidden");
    formModal.classList.remove("flex");
}

async function submitProjectForm(e) {
    e.preventDefault();

    const payload = {
        name: formName.value,
        customerId: formCustomer.value || null,
        startDate: formStart.value || null,
        endDate: formEnd.value || null,
    };

    let url = API_BASE;
    let method = "POST";

    if (formMode.value === "edit" && formId.value) {
        url = `${API_BASE}/${formId.value}`;
        method = "PATCH";
    }

    try {
        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!resp.ok) {
            console.error("Save failed:", await resp.text());
            throw new Error(`HTTP ${resp.status}`);
        }

        closeFormModal();
        await loadProjects(searchInput.value.trim());
    } catch (err) {
        console.error("Error saving project:", err);
    }
}

async function deleteProject(projectId) {
    if (!projectId) return;
    const confirmed = window.confirm("Delete this project?");
    if (!confirmed) return;

    try {
        const resp = await fetch(`${API_BASE}/${projectId}`, { method: "DELETE" });
        if (!resp.ok && resp.status !== 204) {
            console.error("Delete failed:", await resp.text());
            throw new Error(`HTTP ${resp.status}`);
        }
        await loadProjects(searchInput.value.trim());
    } catch (err) {
        console.error("Error deleting project:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    loadCustomers();

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            loadProjects(searchInput.value.trim());
        });
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                loadProjects(searchInput.value.trim());
            }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => loadProjects(searchInput.value.trim()));
    }

    if (createBtn) {
        createBtn.addEventListener("click", openFormForCreate);
    }

    if (tableBody) {
        tableBody.addEventListener("click", (e) => {
            const openBtn = e.target.closest(".open-parent");
            if (openBtn) {
                window.location.href = `parent-project.html?id=${openBtn.dataset.projectId}`;
                return;
            }
            const editBtn = e.target.closest(".edit-project");
            if (editBtn) {
                openFormForEdit(editBtn.dataset.projectId);
                return;
            }
            const deleteBtn = e.target.closest(".delete-project");
            if (deleteBtn) {
                deleteProject(deleteBtn.dataset.projectId);
            }
        });
    }

    if (modal && modalClose) {
        modalClose.addEventListener("click", () => {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        });
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            }
        });
    }

    if (formModal && formModalClose && formModalCancel) {
        const close = () => closeFormModal();
        formModalClose.addEventListener("click", close);
        formModalCancel.addEventListener("click", close);
        formModal.addEventListener("click", (e) => {
            if (e.target === formModal) closeFormModal();
        });
    }

    if (form) {
        form.addEventListener("submit", submitProjectForm);
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modal && !modal.classList.contains("hidden")) {
                modal.classList.add("hidden");
                modal.classList.remove("flex");
            }
            if (formModal && !formModal.classList.contains("hidden")) {
                closeFormModal();
            }
        }
    });
});
