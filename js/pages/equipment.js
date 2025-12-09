const API_BASE = "http://localhost:8080/api/equipment";

document.addEventListener("DOMContentLoaded", () => {
    loadEquipment();
    setupCreateButton();
    setupFormModal();
    setupSearch()
});

async function loadEquipment() {
    const response = await fetch(API_BASE);
    const equipmentList = await response.json();
    renderEquipmentTable(equipmentList);
}

async function renderEquipmentTable(list) {
    const table = document.querySelector("table");

    // Clear old rows
    table.querySelectorAll("tbody").forEach(tbody => tbody.remove());
    const tbody = document.createElement("tbody");

    for (let e of list) {
        const pieces = await fetch(`${API_BASE}/${e.id}/pieces`).then(r => r.json());

        const row = document.createElement("tr");
        row.className = "border-b border-gray-700 hover:bg-gray-700 cursor-pointer";

        row.innerHTML = `
            <td class="px-6 py-3"><input type="checkbox"></td>
            <td class="px-6 py-3">${e.id}</td>
            <td class="px-6 py-3">${e.name}</td>
            <td class="px-6 py-3">${pieces.length}</td>
            <td class="px-6 py-3">${e.pricePerDay ?? "-"}</td>
            <td class="px-6 py-3">${e.category ?? "-"}</td>
            <td class="px-6 py-3 space-x-2">
                <button
                    class="edit-equipment px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white"
                    data-id="${e.id}">
                    Edit
                </button>
                <button
                    class="delete-equipment px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white"
                    data-id="${e.id}">
                    Delete
                </button>
            </td>
        `;

        row.addEventListener("click", () => openEquipmentDetails(e));

        const editBtn = row.querySelector(".edit-equipment");
        editBtn.addEventListener("click", (ev) => {
            ev.stopPropagation(); // prevent row-click
            openFormModal("edit", e);
        });

        const deleteBtn = row.querySelector(".delete-equipment");
        deleteBtn.addEventListener("click", async (ev) => {
            ev.stopPropagation(); // prevent row-click

            try {
                // Check quantity before deletion
                const qResp = await fetch(`${API_BASE}/${e.id}/quantity`);
                const quantity = await qResp.json();

                const confirmed = window.confirm(
                    `WARNING!\n\n` +
                    `You are about to delete "${e.name}" (ID ${e.id}).\n` +
                    `This equipment has ${quantity} attached pieces.\n\n` +
                    `This action is PERMANENT and CANNOT be undone.\n\n` +
                    `Are you absolutely sure you want to continue?`
                );

            if (!confirmed) return;

            const resp = await fetch(`${API_BASE}/${e.id}`, {
                method: "DELETE",
            });

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
        });

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
}

// ---------------------- SEARCH -------------------------

function setupSearch() {
    document.getElementById("search-btn").addEventListener("click", async () => {
        const query = document.getElementById("search-input").value.trim().toLowerCase();

        // Empty search -> reload all
        if (query === "") {
            loadEquipment();
            return;
        }

        const response = await fetch(API_BASE);
        const equipmentList = await response.json();

        const filtered = equipmentList.filter(e =>
            (e.name && e.name.toLowerCase().includes(query)) ||
            (e.category && e.category.toLowerCase().includes(query)) ||
            String(e.id).includes(query)
        );

        renderEquipmentTable(filtered);
    });
}

// --------------------- MODALS -------------------------

function setupCreateButton() {
    document.getElementById("create-equipment-btn").addEventListener("click", () => {
        openFormModal("create");
    });
}

function setupFormModal() {
    const modal = document.getElementById("equipment-form-modal");
    document.getElementById("equipment-form-close").onclick = () => modal.classList.add("hidden");
    document.getElementById("equipment-form-cancel").onclick = () => modal.classList.add("hidden");

    document.getElementById("equipment-form").onsubmit = async (e) => {
        e.preventDefault();

        const mode = document.getElementById("equipment-form-mode").value;
        const id = document.getElementById("equipment-id").value;

        const equipment = {
            name: document.getElementById("form-name").value,
            category: document.getElementById("form-category").value,
            description: document.getElementById("form-description").value,
            pricePerDay: document.getElementById("form-priceperday").value
                ? parseFloat(document.getElementById("form-priceperday").value)
                : null,
            retailPrice: document.getElementById("form-retailprice").value
                ? parseFloat(document.getElementById("form-retailprice").value)
                : null,
            imageUrl: document.getElementById("form-imageURL").value
        };


        if (mode === "create") {
            await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipment)
            });
        } else {
            await fetch(`${API_BASE}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(equipment)
            });
        }

        modal.classList.add("hidden");
        loadEquipment();
    };
}

function openFormModal(mode, equipment = null) {
    const modal = document.getElementById("equipment-form-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex"); // ensure flex display

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

        document.getElementById("form-name").value = equipment.name;
        document.getElementById("form-category").value = equipment.category;
        document.getElementById("form-description").value = equipment.description;
        document.getElementById("form-priceperday").value = equipment.pricePerDay;
        document.getElementById("form-retailprice").value = equipment.retailPrice;
        document.getElementById("form-imageURL").value = equipment.imageUrl;
    }
}

// ------------------------ DETAILS MODAL -------------------------

function openEquipmentDetails(equipment) {
    const modal = document.getElementById("equipment-modal");
    modal.classList.remove("hidden");

    // Close btn
    document.getElementById("equipment-modal-close").onclick = () => modal.classList.add("hidden");

    // Title
    document.getElementById("equipment-modal-title").innerText = equipment.name;

    // Image
    const img = document.getElementById("equipment-modal-image");
    img.src = equipment.imageUrl || 'https://via.placeholder.com/150';
    img.alt = equipment.name;

    // Details
// LEFT
    const details = document.getElementById("equipment-modal-details");
    details.innerHTML = `
    <p><b>Category:</b> ${equipment.category ?? "-"}</p>
    <p><b>Price per day:</b> ${equipment.pricePerDay ?? "-"} DKK</p>
    <p><b>Retail price:</b> ${equipment.retailPrice ?? "-"} DKK</p>
`;

// RIGHT
    document.getElementById("equipment-modal-description").innerText =
        equipment.description || "No description available.";


    // Quantity list container
    const quantityList = document.getElementById("equipment-quantity-list");

    // Quantity counter
    async function loadQuantity() {
        try {
            const res = await fetch(`${API_BASE}/${equipment.id}/pieces`);
            const pieces = await res.json();

            quantityList.innerHTML = '';

            if (pieces.length === 0) {
                quantityList.innerHTML = '<li class="text-gray-400 italic">No pieces added yet</li>';
                return;
            }

            pieces.forEach(p => {
                const li = document.createElement("li");
                li.className = "flex items-center justify-between px-2 py-1 bg-gray-800 rounded mb-1";

                li.innerHTML = `
                <span>${p.serial_number}</span>
                <button
                    class="delete-piece bg-red-0 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs"
                    data-id="${p.id}">
                    ❌
                </button>
            `;

                // DELETE btn
                li.querySelector(".delete-piece").addEventListener("click", async (ev) => {
                    ev.stopPropagation(); // do NOT trigger parent click

                    const confirmed = confirm(
                        `Delete piece with serial: "${p.serial_number}"?\n\nThis cannot be undone.`
                    );

                    if (!confirmed) return;

                    try {
                        const resp = await fetch(`http://localhost:8080/api/pieces/${p.id}`, {
                            method: "DELETE",
                        });

                        if (!resp.ok && resp.status !== 204) {
                            console.error("Failed to delete:", await resp.text());
                            alert("Failed to delete piece.");
                            return;
                        }

                        await loadQuantity(); // refresh list
                        await loadEquipment(); // refresh table counts

                    } catch (err) {
                        console.error("Error deleting piece:", err);
                        alert("Error deleting piece");
                    }
                });

                quantityList.appendChild(li);
            });

        } catch (e) {
            console.error(e);
            quantityList.innerHTML = '<li class="text-red-500">Failed to load pieces</li>';
        }
    }


    // Show/Hide add piece field
    const addContainer = document.getElementById("add-piece-container");
    document.getElementById("show-add-piece").onclick = () => {
        addContainer.classList.toggle("hidden");
    };

    loadQuantity();

    // Add btn
    const addBtn = document.getElementById("add-piece-btn");
    addBtn.onclick = async () => {
        const serialInput = document.getElementById("new-piece-serial");
        const serial = serialInput.value.trim();
        if (!serial) return alert("Please enter a serial number");

        try {
            const response = await fetch(`${API_BASE}/${equipment.id}/pieces`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serial_number: serial })
            });

            if (response.ok) {
                serialInput.value = "";
                loadQuantity();
                loadEquipment()
            } else {
                const text = await response.text();
                console.error("Failed to add piece:", response.status, text);
                alert("Failed to add piece");
            }
        } catch (err) {
            console.error("Error adding piece:", err);
            alert("Error adding piece");
        }
    };
}
