const API_BASE = "http://localhost:8080/api/equipment";
const PIECES_BASE = "http://localhost:8080/api/pieces";

document.addEventListener("DOMContentLoaded", () => {
  loadEquipment().catch(console.error);
  setupCreateButton();
  setupFormModal();
  setupSearch();
  setupDetailsModalStaticControls(); // controls that don't depend on which equipment is open
});

async function loadEquipment() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error(`Failed to load equipment: ${response.status}`);
  const equipmentList = await response.json();

  await renderEquipmentTable(equipmentList);
  await renderStats(equipmentList);
}

async function renderStats(equipmentList) {
  // Du har ikke endpoints for repairs/shortages i din kode, så vi sætter noget fornuftigt:
  // - Total Items: antal equipment-typer
  // - Repairs Needed / Shortages: placeholder "-" (eller 0)
  const totalEl = document.getElementById("inventory-total");
  const repairsEl = document.getElementById("inventory-repairs-needed");
  const shortagesEl = document.getElementById("inventory-shortages");

  if (totalEl) totalEl.textContent = String(equipmentList.length);
  if (repairsEl) repairsEl.textContent = "-";
  if (shortagesEl) shortagesEl.textContent = "-";
}

async function renderEquipmentTable(list) {
  const table = document.getElementById("equipment-table");
  const tbody = table.querySelector("tbody");

  tbody.innerHTML = "";

  for (const e of list) {
    let pieces = [];
    try {
      const piecesResp = await fetch(`${API_BASE}/${e.id}/pieces`);
      if (piecesResp.ok) pieces = await piecesResp.json();
    } catch {
      // ignore; show 0
    }

    const row = document.createElement("tr");
    row.className = "border-b border-gray-700 hover:bg-gray-700 cursor-pointer";

    row.innerHTML = `
      <td class="px-6 py-3"><input type="checkbox" /></td>
      <td class="px-6 py-3">${escapeHtml(String(e.id))}</td>
      <td class="px-6 py-3">${escapeHtml(e.name ?? "")}</td>
      <td class="px-6 py-3">${pieces.length}</td>
      <td class="px-6 py-3">${e.pricePerDay ?? "-"}</td>
      <td class="px-6 py-3">${escapeHtml(e.category ?? "-")}</td>
      <td class="px-6 py-3 space-x-2">
        <button
          class="edit-equipment px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white"
          data-id="${escapeAttr(String(e.id))}">
          Edit
        </button>
        <button
          class="delete-equipment px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
          data-id="${escapeAttr(String(e.id))}">
          Delete
        </button>
      </td>
    `;

    // Row click => details
    row.addEventListener("click", () => openEquipmentDetails(e));

    // Edit
    row.querySelector(".edit-equipment").addEventListener("click", (ev) => {
      ev.stopPropagation();
      openFormModal("edit", e);
    });

    // Delete
    row.querySelector(".delete-equipment").addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await deleteEquipmentWithConfirm(e);
    });

    tbody.appendChild(row);
  }
}

// ---------------------- SEARCH -------------------------

function setupSearch() {
  const searchBtn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("search-clear-btn");
  const input = document.getElementById("search-input");

  if (!searchBtn || !input) return;

  searchBtn.addEventListener("click", async () => {
    const query = input.value.trim().toLowerCase();

    if (query === "") {
      await loadEquipment();
      return;
    }

    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error(`Search load failed: ${response.status}`);
    const equipmentList = await response.json();

    const filtered = equipmentList.filter((e) =>
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.category && e.category.toLowerCase().includes(query)) ||
      String(e.id).includes(query)
    );

    await renderEquipmentTable(filtered);
    await renderStats(filtered);
  });

  // Enter triggers search
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") searchBtn.click();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      input.value = "";
      await loadEquipment();
    });
  }
}

// --------------------- CREATE/EDIT MODAL -------------------------

function setupCreateButton() {
  const btn = document.getElementById("create-equipment-btn");
  if (!btn) return;
  btn.addEventListener("click", () => openFormModal("create"));
}

function setupFormModal() {
  const modal = document.getElementById("equipment-form-modal");
  const closeBtn = document.getElementById("equipment-form-close");
  const cancelBtn = document.getElementById("equipment-form-cancel");
  const form = document.getElementById("equipment-form");

  if (!modal || !form) return;

  const close = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  if (closeBtn) closeBtn.onclick = close;
  if (cancelBtn) cancelBtn.onclick = close;

  form.onsubmit = async (ev) => {
    ev.preventDefault();

    const mode = document.getElementById("equipment-form-mode").value;
    const id = document.getElementById("equipment-id").value;

    const equipment = {
      name: document.getElementById("form-name").value,
      category: document.getElementById("form-category").value || null,
      description: document.getElementById("form-description").value || null,
      pricePerDay: document.getElementById("form-priceperday").value
        ? parseFloat(document.getElementById("form-priceperday").value)
        : null,
      retailPrice: document.getElementById("form-retailprice").value
        ? parseFloat(document.getElementById("form-retailprice").value)
        : null,
      imageUrl: document.getElementById("form-imageURL").value || null,
    };

    if (mode === "create") {
      const resp = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipment),
      });
      if (!resp.ok) {
        alert("Failed to create equipment.");
        console.error(await resp.text());
        return;
      }
    } else {
      const resp = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipment),
      });
      if (!resp.ok) {
        alert("Failed to update equipment.");
        console.error(await resp.text());
        return;
      }
    }

    close();
    await loadEquipment();
  };
}

function openFormModal(mode, equipment = null) {
  const modal = document.getElementById("equipment-form-modal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("equipment-form-mode").value = mode;

  if (mode === "create") {
    document.getElementById("equipment-form-title").innerText = "Add Equipment";
    document.getElementById("equipment-id").value = "";

    document.getElementById("form-name").value = "";
    document.getElementById("form-category").value = "";
    document.getElementById("form-description").value = "";
    document.getElementById("form-priceperday").value = "";
    document.getElementById("form-retailprice").value = "";
    document.getElementById("form-imageURL").value = "";
  } else {
    document.getElementById("equipment-form-title").innerText = "Edit Equipment";
    document.getElementById("equipment-id").value = equipment.id;

    document.getElementById("form-name").value = equipment.name ?? "";
    document.getElementById("form-category").value = equipment.category ?? "";
    document.getElementById("form-description").value = equipment.description ?? "";
    document.getElementById("form-priceperday").value = equipment.pricePerDay ?? "";
    document.getElementById("form-retailprice").value = equipment.retailPrice ?? "";
    document.getElementById("form-imageURL").value = equipment.imageUrl ?? "";
  }
}

// ------------------------ DETAILS MODAL -------------------------

let currentEquipmentId = null;

function setupDetailsModalStaticControls() {
  const modal = document.getElementById("equipment-modal");
  const closeBtn = document.getElementById("equipment-modal-close");
  const showAddPieceBtn = document.getElementById("show-add-piece");
  const addContainer = document.getElementById("add-piece-container");
  const addBtn = document.getElementById("add-piece-btn");

  if (!modal) return;

  const close = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    currentEquipmentId = null;

    // reset add piece UI
    if (addContainer) addContainer.classList.add("hidden");
    const serialInput = document.getElementById("new-piece-serial");
    if (serialInput) serialInput.value = "";
  };

  if (closeBtn) closeBtn.onclick = close;

  // click outside content closes modal (valgfrit)
  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) close();
  });

  if (showAddPieceBtn && addContainer) {
    showAddPieceBtn.onclick = () => addContainer.classList.toggle("hidden");
  }

  if (addBtn) {
    addBtn.onclick = async () => {
      if (!currentEquipmentId) return;

      const serialInput = document.getElementById("new-piece-serial");
      const serial = (serialInput?.value ?? "").trim();
      if (!serial) return alert("Please enter a serial number");

      try {
        const response = await fetch(`${API_BASE}/${currentEquipmentId}/pieces`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serial_number: serial }),
        });

        if (!response.ok) {
          console.error("Failed to add piece:", response.status, await response.text());
          alert("Failed to add piece");
          return;
        }

        serialInput.value = "";
        await loadPiecesIntoModal(currentEquipmentId);
        await loadEquipment(); // refresh table counts
      } catch (err) {
        console.error("Error adding piece:", err);
        alert("Error adding piece");
      }
    };
  }
}

function openEquipmentDetails(equipment) {
  const modal = document.getElementById("equipment-modal");
  if (!modal) return;

  currentEquipmentId = equipment.id;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Title
  document.getElementById("equipment-modal-title").innerText = equipment.name ?? "";

  // Image
  const img = document.getElementById("equipment-modal-image");
  img.src = equipment.imageUrl || "https://via.placeholder.com/800x500?text=No+Image";
  img.alt = equipment.name ?? "Equipment";

  // Details (left)
  const details = document.getElementById("equipment-modal-details");
  details.innerHTML = `
    <p><b>Category:</b> ${escapeHtml(equipment.category ?? "-")}</p>
    <p><b>Price per day:</b> ${equipment.pricePerDay ?? "-"} DKK</p>
    <p><b>Retail price:</b> ${equipment.retailPrice ?? "-"} DKK</p>
  `;

  // Description (right)
  document.getElementById("equipment-modal-description").innerText =
    equipment.description || "No description available.";

  // Reset add piece UI
  const addContainer = document.getElementById("add-piece-container");
  if (addContainer) addContainer.classList.add("hidden");
  const serialInput = document.getElementById("new-piece-serial");
  if (serialInput) serialInput.value = "";

  // Load pieces list
  loadPiecesIntoModal(equipment.id).catch(console.error);
}

async function loadPiecesIntoModal(equipmentId) {
  const quantityList = document.getElementById("equipment-quantity-list");
  if (!quantityList) return;

  try {
    const res = await fetch(`${API_BASE}/${equipmentId}/pieces`);
    if (!res.ok) throw new Error(`Failed to load pieces: ${res.status}`);
    const pieces = await res.json();

    quantityList.innerHTML = "";

    if (!Array.isArray(pieces) || pieces.length === 0) {
      quantityList.innerHTML = `<li class="text-gray-400 italic">No pieces added yet</li>`;
      return;
    }

    pieces.forEach((p) => {
      const li = document.createElement("li");
      li.className = "flex items-center justify-between px-3 py-2 bg-gray-800 rounded";

      li.innerHTML = `
        <span>${escapeHtml(p.serial_number ?? "")}</span>
        <button
          class="delete-piece bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
          data-id="${escapeAttr(String(p.id))}">
          Delete
        </button>
      `;

      li.querySelector(".delete-piece").addEventListener("click", async (ev) => {
        ev.stopPropagation();

        const confirmed = confirm(
          `Delete piece with serial: "${p.serial_number}"?\n\nThis cannot be undone.`
        );
        if (!confirmed) return;

        try {
          const resp = await fetch(`${PIECES_BASE}/${p.id}`, { method: "DELETE" });
          if (!resp.ok && resp.status !== 204) {
            console.error("Failed to delete:", await resp.text());
            alert("Failed to delete piece.");
            return;
          }

          await loadPiecesIntoModal(equipmentId);
          await loadEquipment();
        } catch (err) {
          console.error("Error deleting piece:", err);
          alert("Error deleting piece");
        }
      });

      quantityList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    quantityList.innerHTML = `<li class="text-red-500">Failed to load pieces</li>`;
  }
}

// ------------------------ DELETE EQUIPMENT -------------------------

async function deleteEquipmentWithConfirm(e) {
  try {
    // Check quantity before deletion
    const qResp = await fetch(`${API_BASE}/${e.id}/quantity`);
    let quantity = 0;
    if (qResp.ok) {
      quantity = await qResp.json();
    } else {
      // fallback: pieces endpoint
      const pieces = await fetch(`${API_BASE}/${e.id}/pieces`).then((r) => (r.ok ? r.json() : []));
      quantity = Array.isArray(pieces) ? pieces.length : 0;
    }

    const confirmed = window.confirm(
      `WARNING!\n\n` +
      `You are about to delete "${e.name}" (ID ${e.id}).\n` +
      `This equipment has ${quantity} attached pieces.\n\n` +
      `This action is PERMANENT and CANNOT be undone.\n\n` +
      `Are you absolutely sure you want to continue?`
    );
    if (!confirmed) return;

    const resp = await fetch(`${API_BASE}/${e.id}`, { method: "DELETE" });

    if (!resp.ok && resp.status !== 204) {
      console.error("Delete failed:", await resp.text());
      alert("Failed to delete equipment.");
      return;
    }

    alert(`"${e.name}" and all related pieces have been permanently deleted.`);
    await loadEquipment();
  } catch (err) {
    console.error("Error deleting equipment:", err);
    alert("An error occurred while deleting. Check the console for details.");
  }
}

// ------------------------ HELPERS -------------------------

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  // For simple attribute use; ensures quotes don’t break attributes
  return escapeHtml(str);
}
