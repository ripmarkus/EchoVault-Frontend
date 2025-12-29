const API_BASE = "/api/customers";
const CONTACTS_API_BASE = "/api/contacts";

let allCustomers = []; // alle kunder (eksterne)
let allContacts = [];  // alle interne users

// ----------------------
// GROUPING
// ----------------------

// Gruppér kunder efter parent (string som "cust-1")
function groupCustomers(customers) {
  const parents = [];
  const childrenByParent = {};

  customers.forEach((c) => {
    if (!c.parent) {
      parents.push(c);
    } else {
      if (!childrenByParent[c.parent]) {
        childrenByParent[c.parent] = [];
      }
      childrenByParent[c.parent].push(c);
    }
  });

  return { parents, childrenByParent };
}

// ----------------------
// RENDER
// ----------------------
function renderCustomers(customers) {
  const tableBody = document.getElementById("customers-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const { parents, childrenByParent } = groupCustomers(customers);

  parents.forEach((parent) => {
    const hasChildren = !!childrenByParent[parent.id]?.length;
    const parentAddress = parent.address ?? "";

    // Parent row
    const parentRow = document.createElement("tr");
    parentRow.className =
      "border-b border-gray-700 hover:bg-gray-700/60 transition-colors";
    parentRow.dataset.rowId = parent.id;

    parentRow.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-2">
          ${
            hasChildren
              ? `<button
                    class="toggle-subcustomers w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-xs"
                    data-toggle-children="${parent.id}"
                 >
                    ▶
                 </button>`
              : `<span class="w-6 h-6"></span>`
          }
          <input type="checkbox" value="${parent.id}" />
        </div>
      </td>
      <td class="text-left font-medium">${parent.id}</td>
      <td class="text-left">${parent.name}</td>
      <td class="text-left">${parent.cvr ?? ""}</td>
      <td class="text-left">${parentAddress}</td>
      <td class="text-left">
        <div class="flex gap-2">
          <a
            href="customer-profile.html?id=${encodeURIComponent(parent.id)}"
            class="px-3 py-1 text-xs rounded bg-[#55A5F8] hover:bg-[#3F8CE0] text-white"
          >
            View
          </a>

          <button
            class="delete-customer px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
            data-customer-id="${parent.id}"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(parentRow);

    // Sub customers (hidden by default)
    if (hasChildren) {
      childrenByParent[parent.id].forEach((child) => {
        const childAddress = child.address ?? "";

        const childRow = document.createElement("tr");
        childRow.className =
          "subcustomer-row hidden border-b border-gray-800 bg-gray-900/80 hover:bg-gray-800";
        childRow.dataset.parentId = parent.id;

        // SUB-CUSTOMERS NOW HAVE THE SAME ACTION BUTTONS AS PARENT
        childRow.innerHTML = `
          <td class="p-7">
            <div class="flex items-center gap-2 pl-8">
              <span class="text-xs uppercase tracking-wide text-gray-400">Sub</span>
              <input type="checkbox" value="${child.id}" />
            </div>
          </td>
          <td class="p-7 text-left">${child.id}</td>
          <td class="p-7 text-left">${child.name}</td>
          <td class="p-7 text-left">${child.cvr ?? ""}</td>
          <td class="p-7 text-left">${childAddress}</td>
          <td class="p-7 text-left">
            <div class="flex gap-2">
              <a
                href="customer-profile.html?id=${encodeURIComponent(child.id)}"
                class="px-3 py-1 text-xs rounded bg-[#55A5F8] hover:bg-[#3F8CE0] text-white"
              >
                View
              </a>

              <button
                class="delete-customer px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
                data-customer-id="${child.id}"
              >
                Delete
              </button>
            </div>
          </td>
        `;

        tableBody.appendChild(childRow);
      });
    }
  });

  // Event delegation: delete + toggle
  tableBody.onclick = (e) => {
    // Delete
    const deleteBtn = e.target.closest(".delete-customer");
    if (deleteBtn) {
      const id = deleteBtn.dataset.customerId;
      handleDeleteCustomer(id);
      return;
    }

    // Toggle subcustomers
    const btn = e.target.closest("[data-toggle-children]");
    if (btn) {
      const parentId = btn.dataset.toggleChildren;
      const rows = tableBody.querySelectorAll(`tr[data-parent-id="${parentId}"]`);
      if (!rows.length) return;

      const shouldShow = rows[0].classList.contains("hidden");

      rows.forEach((row) => row.classList.toggle("hidden", !shouldShow));
      btn.textContent = shouldShow ? "▼" : "▶";
    }
  };
}

// ----------------------
// VIEW MODAL (kept as-is)
// ----------------------
async function openCustomerModal(id) {
  const modal = document.getElementById("customer-modal");
  const titleEl = document.getElementById("customer-modal-title");
  const contentEl = document.getElementById("customer-modal-content");

  try {
    const resp = await fetch(`${API_BASE}/${id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const addressParts = [data.addressLine, data.postalCode, data.city].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    titleEl.textContent = `Customer: ${data.name}`;
    contentEl.innerHTML = `
      <div><span class="font-semibold">ID:</span> ${data.id}</div>
      <div><span class="font-semibold">Type:</span> ${data.type ?? "-"}</div>
      <div><span class="font-semibold">CVR:</span> ${data.cvr ?? "-"}</div>
      <div><span class="font-semibold">Name:</span> ${data.name}</div>
      <div><span class="font-semibold">Phone:</span> ${data.phone ?? "-"}</div>
      <div><span class="font-semibold">Email:</span> ${data.email ?? "-"}</div>
      <div><span class="font-semibold">Address:</span> ${fullAddress || "-"}</div>
      <div><span class="font-semibold">Created at:</span> ${data.createdAt ?? "-"}</div>
      <div><span class="font-semibold">Parent:</span> ${data.parent ?? "-"}</div>
      <div><span class="font-semibold">Children:</span> ${
        data.children && data.children.length ? data.children.join(", ") : "-"
      }</div>
      <div><span class="font-semibold">Contact person ID:</span> ${data.contact?.id ?? "-"}</div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } catch (err) {
    console.error("Error loading customer details:", err);
    titleEl.textContent = "Error";
    contentEl.innerHTML = `<div class="text-red-300 text-sm">Could not load customer details.</div>`;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

// ----------------------
// FORM MODAL
// ----------------------
function openCustomerFormModalForCreate() {
  const modal = document.getElementById("customer-form-modal");
  document.getElementById("customer-form-title").textContent = "New customer";
  document.getElementById("customer-form-mode").value = "create";
  document.getElementById("customer-form-id").value = "";

  document.getElementById("form-name").value = "";
  document.getElementById("form-cvr").value = "";
  document.getElementById("form-phone").value = "";
  document.getElementById("form-email").value = "";
  document.getElementById("form-addressLine").value = "";
  document.getElementById("form-postalCode").value = "";
  document.getElementById("form-city").value = "";

  populateParentDropdown(null, null);
  populateContactDropdown(null);

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

async function openCustomerFormModalForEdit(id) {
  const modal = document.getElementById("customer-form-modal");
  document.getElementById("customer-form-title").textContent = "Edit customer";
  document.getElementById("customer-form-mode").value = "edit";
  document.getElementById("customer-form-id").value = id;

  try {
    const resp = await fetch(`${API_BASE}/${id}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    document.getElementById("form-name").value = data.name ?? "";
    document.getElementById("form-cvr").value = data.cvr ?? "";
    document.getElementById("form-phone").value = data.phone ?? "";
    document.getElementById("form-email").value = data.email ?? "";
    document.getElementById("form-addressLine").value = data.addressLine ?? "";
    document.getElementById("form-postalCode").value = data.postalCode ?? "";
    document.getElementById("form-city").value = data.city ?? "";

    populateParentDropdown(data.id, data.parent ?? null);
    populateContactDropdown(data.contact?.id ?? null);

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } catch (err) {
    console.error("Error loading customer for edit:", err);
  }
}

async function submitCustomerForm(e) {
  e.preventDefault();

  const mode = document.getElementById("customer-form-mode").value;
  const id = document.getElementById("customer-form-id").value;

  const payload = {
    name: document.getElementById("form-name").value,
    phone: document.getElementById("form-phone").value || null,
    email: document.getElementById("form-email").value || null,
    cvr: document.getElementById("form-cvr").value || null,
    addressLine: document.getElementById("form-addressLine").value || null,
    postalCode: document.getElementById("form-postalCode").value || null,
    city: document.getElementById("form-city").value || null,
    parentId: document.getElementById("form-parentId")?.value || null,
    contactId: document.getElementById("form-contactId")?.value || null
  };

  let url = API_BASE;
  let method = "POST";

  if (mode === "edit" && id) {
    url = `${API_BASE}/${id}`;
    method = "PATCH";
  }

  try {
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      console.error("Save failed:", await resp.text());
      throw new Error(`HTTP ${resp.status}`);
    }

    closeCustomerFormModal();
    await loadCustomers();
  } catch (err) {
    console.error("Error saving customer:", err);
  }
}

function closeCustomerFormModal() {
  const modal = document.getElementById("customer-form-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ----------------------
// DELETE
// ----------------------
async function handleDeleteCustomer(id) {
  const confirmed = window.confirm("Are you sure you want to delete this customer?");
  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

    if (resp.status === 400 || resp.status === 409) {
      const msg = await resp.text();
      console.error("Delete failed:", msg);
      alert("Could not delete customer.\n" + msg);
      return;
    }

    if (!resp.ok && resp.status !== 204) {
      console.error("Delete failed:", await resp.text());
      throw new Error(`HTTP ${resp.status}`);
    }

    await loadCustomers();
  } catch (err) {
    console.error("Error deleting customer:", err);
    alert("Error deleting customer. See console for details.");
  }
}

// ----------------------
// CONTACTS / DROPDOWNS
// ----------------------
async function loadContacts() {
  try {
    const resp = await fetch(CONTACTS_API_BASE);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    allContacts = await resp.json();
  } catch (err) {
    console.error("Error loading contacts:", err);
  }
}

function populateParentDropdown(currentCustomerId = null, selectedParentId = null) {
  const select = document.getElementById("form-parentId");
  if (!select) return;

  select.innerHTML = "";

  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "No parent customer";
  select.appendChild(noneOpt);

  allCustomers.forEach((cust) => {
    if (currentCustomerId && cust.id === currentCustomerId) return;

    const opt = document.createElement("option");
    opt.value = cust.id;
    opt.textContent = cust.name;
    if (selectedParentId && selectedParentId === cust.id) opt.selected = true;
    select.appendChild(opt);
  });
}

function populateContactDropdown(selectedContactId = null) {
  const select = document.getElementById("form-contactId");
  if (!select) return;

  select.innerHTML = "";

  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "No contact person";
  select.appendChild(noneOpt);

  allContacts.forEach((contact) => {
    const opt = document.createElement("option");
    opt.value = contact.id;
    opt.textContent = contact.name || contact.email || contact.id;

    // normalize compare (string vs number)
    if (selectedContactId != null && String(selectedContactId) === String(contact.id)) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });
}

// ----------------------
// LOAD CUSTOMERS
// ----------------------
async function loadCustomers() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const customers = await response.json();
    allCustomers = customers; // cache for dropdown
    renderCustomers(customers);
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

// Loader kunder med søgning
async function loadCustomerSearch(query = "") {
  try {
    const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const customers = await response.json();
    renderCustomers(customers);
  } catch (err) {
    console.error("Error loading customers:", err);
  }
}

// ----------------------
// INIT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadContacts();

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const viewModal = document.getElementById("customer-modal");
  const viewModalClose = document.getElementById("customer-modal-close");

  const formModal = document.getElementById("customer-form-modal");
  const formModalClose = document.getElementById("customer-form-close");
  const formModalCancel = document.getElementById("customer-form-cancel");
  const createBtn = document.getElementById("create-customer-btn");
  const form = document.getElementById("customer-form");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      loadCustomerSearch(searchInput.value.trim());
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") loadCustomerSearch(searchInput.value.trim());
    });
  }

  // View modal close
  if (viewModal && viewModalClose) {
    viewModalClose.addEventListener("click", () => {
      viewModal.classList.add("hidden");
      viewModal.classList.remove("flex");
    });

    viewModal.addEventListener("click", (e) => {
      if (e.target === viewModal) {
        viewModal.classList.add("hidden");
        viewModal.classList.remove("flex");
      }
    });
  }

  // Form modal open (create)
  if (createBtn) {
    createBtn.addEventListener("click", () => openCustomerFormModalForCreate());
  }

  // Form modal close
  if (formModal && formModalClose && formModalCancel) {
    const close = () => closeCustomerFormModal();

    formModalClose.addEventListener("click", close);
    formModalCancel.addEventListener("click", close);

    formModal.addEventListener("click", (e) => {
      if (e.target === formModal) closeCustomerFormModal();
    });
  }

  // Form submit
  if (form) {
    form.addEventListener("submit", submitCustomerForm);
  }

  // ESC closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (viewModal && !viewModal.classList.contains("hidden")) {
        viewModal.classList.add("hidden");
        viewModal.classList.remove("flex");
      }
      if (formModal && !formModal.classList.contains("hidden")) {
        closeCustomerFormModal();
      }
    }
  });
});
