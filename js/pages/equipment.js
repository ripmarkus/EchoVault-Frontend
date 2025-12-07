const API_BASE = "http://localhost:8080/api/equipment";

document.addEventListener("DOMContentLoaded", () => {
    loadEquipment();
    setupCreateButton();
    setupFormModal();
});

async function loadEquipment() {
    const table = document.querySelector("table");

    let response = await fetch(API_BASE);
    let equipmentList = await response.json();

    // Clear old rows
    table.querySelectorAll("tbody").forEach(tbody => tbody.remove());
    let tbody = document.createElement("tbody");

    for (let e of equipmentList) {
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
        `;

        row.addEventListener("click", () => openEquipmentDetails(e));

        tbody.appendChild(row);
    }

    table.appendChild(tbody);
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

    // Close button
    document.getElementById("equipment-modal-close").onclick = () => modal.classList.add("hidden");

    // Title
    document.getElementById("equipment-modal-title").innerText = equipment.name;

    // Image
    const img = document.getElementById("equipment-modal-image");
    img.src = equipment.imageUrl || 'https://via.placeholder.com/150';
    img.alt = equipment.name;

    // Details
    const details = document.getElementById("equipment-modal-details");
    details.innerHTML = `
        <p><b>Category:</b> ${equipment.category ?? "-"}</p>
        <p><b>Description:</b> ${equipment.description ?? "-"}</p>
        <p><b>Price per day:</b> ${equipment.pricePerDay ?? "-"}</p>
        <p><b>Retail price:</b> ${equipment.retailPrice ?? "-"}</p>
    `;

    // Pieces list container
    const piecesList = document.getElementById("equipment-pieces-list");

    // Function to load pieces from backend
    async function loadPieces() {
        try {
            const res = await fetch(`${API_BASE}/${equipment.id}/pieces`);
            const pieces = await res.json();

            piecesList.innerHTML = ''; // clear existing
            if (pieces.length === 0) {
                piecesList.innerHTML = '<li class="text-gray-400 italic">No pieces added yet</li>';
            } else {
                pieces.forEach(p => {
                    const li = document.createElement("li");
                    li.textContent = p.serial_number; // match backend property
                    li.className = "px-2 py-1 bg-gray-800 rounded";
                    piecesList.appendChild(li);
                });
            }
        } catch (err) {
            console.error("Failed to load pieces:", err);
            piecesList.innerHTML = '<li class="text-red-500">Failed to load pieces</li>';
        }
    }

    // Initial load
    loadPieces();

    // Add piece button
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
                loadPieces(); // reload the list
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
