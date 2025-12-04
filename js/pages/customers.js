const API_BASE = "http://localhost:8080/api/customers";

// Gruppér kunder efter parent (string som "cust-1")
function groupCustomers(customers) {
  const parents = [];
  const childrenByParent = {};

  customers.forEach((c) => {
    if (!c.parent) {
      // ingen parent -> hovedkunde
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

// Renderer hele tabellen med grupperinger
function renderCustomers(customers) {
  const tableBody = document.getElementById("customers-table-body");
  tableBody.innerHTML = "";

  const { parents, childrenByParent } = groupCustomers(customers);

  parents.forEach((parent) => {
    const hasChildren = !!childrenByParent[parent.id]?.length;
    const parentAddress = parent.address ?? "";

    // Parent-række
    const parentRow = document.createElement("tr");
    parentRow.className =
      "border-b border-gray-700 hover:bg-gray-700/60 transition-colors";
    parentRow.dataset.rowId = parent.id;

    parentRow.innerHTML = `
      <td class="p-7">
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
      <td class="p-7 text-left font-medium">${parent.id}</td>
      <td class="p-7 text-left">${parent.name}</td>
      <td class="p-7 text-left">${parent.cvr ?? ""}</td>
      <td class="p-7 text-left">${parentAddress}</td>
      <td class="p-7 text-left">
        <div class="flex gap-2">
          <button
            class="view-customer px-3 py-1 text-xs rounded bg-[#55A5F8] hover:bg-[#3F8CE0] text-white"
            data-customer-id="${parent.id}"
          >
            View
          </button>
          <button
            class="edit-customer px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white"
            data-customer-id="${parent.id}"
          >
            Edit
          </button>

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

    // Subkunder (children) – skjult som udgangspunkt
    if (hasChildren) {
      childrenByParent[parent.id].forEach((child) => {
        const childAddress = child.address ?? "";

        const childRow = document.createElement("tr");
        childRow.className =
          "subcustomer-row hidden border-b border-gray-800 bg-gray-900/80 hover:bg-gray-800";
        childRow.dataset.parentId = parent.id;

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
              <button
                class="view-customer px-3 py-1 text-xs rounded bg-[#55A5F8] hover:bg-[#3F8CE0] text-white"
                data-customer-id="${child.id}"
              >
                View
              </button>
              <button
                class="edit-customer px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white"
                data-customer-id="${child.id}"
              >
                Edit
              </button>
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

  // Event delegation til toggle + view + edit
  tableBody.onclick = (e) => {
    // View-knap
    const viewBtn = e.target.closest(".view-customer");
    if (viewBtn) {
      const id = viewBtn.dataset.customerId; // fx "cust-1"
      openCustomerModal(id);
      return;
    }

    // Edit-knap
    const editBtn = e.target.closest(".edit-customer");
    if (editBtn) {
      const id = editBtn.dataset.customerId;
      openCustomerFormModalForEdit(id);
      return;
    }


    //delete knap
    const deleteBtn = e.target.closest(".delete-customer");
    if(deleteBtn){
      const id = deleteBtn.dataset.customerId;
      handleDeleteCustomer(id);
      return; 
    }

    // Toggle subkunder
    const btn = e.target.closest("[data-toggle-children]");
    if (btn) {
      const parentId = btn.dataset.toggleChildren;
      const rows = tableBody.querySelectorAll(
        `tr[data-parent-id="${parentId}"]`
      );
      if (!rows.length) return;

      const shouldShow = rows[0].classList.contains("hidden");

      rows.forEach((row) => {
        row.classList.toggle("hidden", !shouldShow);
      });

      btn.textContent = shouldShow ? "▼" : "▶";
    }
  };
}

// Hent /api/customers/{id} og åbn view-modal
async function openCustomerModal(id) {
  const modal = document.getElementById("customer-modal");
  const titleEl = document.getElementById("customer-modal-title");
  const contentEl = document.getElementById("customer-modal-content");

  try {
    const resp = await fetch(`${API_BASE}/${id}`);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();

    const addressParts = [data.addressLine, data.postalCode, data.city].filter(
      Boolean
    );
    const fullAddress = addressParts.join(", ");

    titleEl.textContent = `Customer: ${data.name}`;

    contentEl.innerHTML = `
      <div><span class="font-semibold">ID:</span> ${data.id}</div>
      <div><span class="font-semibold">Type:</span> ${data.type ?? "-"}</div>
      <div><span class="font-semibold">CVR:</span> ${data.cvr ?? "-"}</div>
      <div><span class="font-semibold">Name:</span> ${data.name}</div>
      <div><span class="font-semibold">Phone:</span> ${data.phone ?? "-"}</div>
      <div><span class="font-semibold">Email:</span> ${data.email ?? "-"}</div>
      <div><span class="font-semibold">Address:</span> ${
        fullAddress || "-"
      }</div>
      <div><span class="font-semibold">Created at:</span> ${
        data.createdAt ?? "-"
      }</div>
      <div><span class="font-semibold">Parent:</span> ${
        data.parent ?? "-"
      }</div>
      <div><span class="font-semibold">Children:</span> ${
        data.children && data.children.length ? data.children.join(", ") : "-"
      }</div>
      <div><span class="font-semibold">Contact person ID:</span> ${
        data.contact?.id ?? "-"
      }</div>
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

// Åbn form-modal til "create"
function openCustomerFormModalForCreate() {
  const modal = document.getElementById("customer-form-modal");
  document.getElementById("customer-form-title").textContent = "New customer";
  document.getElementById("customer-form-mode").value = "create";
  document.getElementById("customer-form-id").value = "";

  // nulstil felter
  document.getElementById("form-name").value = "";
  document.getElementById("form-cvr").value = "";
  document.getElementById("form-phone").value = "";
  document.getElementById("form-email").value = "";
  document.getElementById("form-addressLine").value = "";
  document.getElementById("form-postalCode").value = "";
  document.getElementById("form-city").value = "";

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

  // Payload matcher CustomerRequest i backend
  const payload = {
    name: document.getElementById("form-name").value,
    phone: document.getElementById("form-phone").value || null,
    email: document.getElementById("form-email").value || null,
    cvr: document.getElementById("form-cvr").value || null,
    addressLine: document.getElementById("form-addressLine").value || null,
    postalCode: document.getElementById("form-postalCode").value || null,
    city: document.getElementById("form-city").value || null,

    // Lige nu sætter vi ikke parent/contact fra UI,
    // så de sendes som null (ingen ændring ved PATCH).
    parentId: null,
    contactId: null,
  };

  let url = API_BASE;
  let method = "POST";

  if (mode === "edit" && id) {
    // Backend: @PatchMapping("/{id}")
    url = `${API_BASE}/${id}`; // fx /api/customers/cust-1
    method = "PATCH";
  }

  try {
    const resp = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error("Save failed:", await resp.text());
      throw new Error(`HTTP ${resp.status}`);
    }

    // Luk modal og reload liste
    closeCustomerFormModal();
    await loadCustomers();
  } catch (err) {
    console.error("Error saving customer:", err);
    // Her kan du evt. vise en fejlmeddelelse i modal'en.
  }
}


function closeCustomerFormModal() {
  const modal = document.getElementById("customer-form-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleDeleteCustomer(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this customer?"
  );
  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (resp.status === 400 || resp.status === 409) {
      // Fx hvis backend siger "Cannot delete customer with sub-customers"
      const msg = await resp.text();
      console.error("Delete failed:", msg);
      alert("Could not delete customer.\n" + msg);
      return;
    }

    if (!resp.ok && resp.status !== 204) {
      console.error("Delete failed:", await resp.text());
      throw new Error(`HTTP ${resp.status}`);
    }

    // Genindlæs liste
    await loadCustomers();
  } catch (err) {
    console.error("Error deleting customer:", err);
    alert("Error deleting customer. See console for details.");
  }
}



// Loader alle kunder
async function loadCustomers() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const customers = await response.json();
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

// Init
document.addEventListener("DOMContentLoaded", () => {
  // Load all initially
  loadCustomers();

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
      const query = searchInput.value.trim();
      loadCustomerSearch(query);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loadCustomerSearch(searchInput.value.trim());
      }
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
    createBtn.addEventListener("click", () => {
      openCustomerFormModalForCreate();
    });
  }

  // Form modal close
  if (formModal && formModalClose && formModalCancel) {
    const close = () => closeCustomerFormModal();

    formModalClose.addEventListener("click", close);
    formModalCancel.addEventListener("click", close);

    formModal.addEventListener("click", (e) => {
      if (e.target === formModal) {
        closeCustomerFormModal();
      }
    });
  }

  // Form submit
  if (form) {
    form.addEventListener("submit", submitCustomerForm);
  }

  // ESC lukker begge modals
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
