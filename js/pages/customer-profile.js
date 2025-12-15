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
// INLINE EDIT HANDLER (FIXED)
// -----------------------------
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-edit-field]");
  if (!btn) return;

  if (!customerId) {
    console.error("Cannot edit: missing customerId");
    return;
  }

  const field = btn.dataset.editField;

  // field -> element-id mapping
  const elementId = "detail-" + (field === "addressLine" ? "address" : field);
  const valueEl = document.getElementById(elementId);

  if (!valueEl) {
    console.error("Missing element:", elementId);
    return;
  }

  // Prevent editing same field twice
  if (valueEl.dataset.editing === "1") return;
  valueEl.dataset.editing = "1";

  const oldValue = valueEl.textContent.trim();
  const input = document.createElement("input");
  input.value = oldValue === "-" ? "" : oldValue;
  input.className =
    "px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full";

  // Keep the element (and its id) intact; swap only its content
  valueEl.textContent = "";
  valueEl.appendChild(input);
  input.focus();

  let done = false;

  async function finishAndReload() {
    valueEl.dataset.editing = "0";
    await loadCustomer();
  }

  async function save() {
    if (done) return;
    done = true;

    const newValue = input.value.trim();

    try {
      const resp = await fetch(`${API_BASE}/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue })
      });

      if (!resp.ok) {
        console.error("PATCH failed:", await resp.text());
      }
    } catch (err) {
      console.error("PATCH error:", err);
    }

    await finishAndReload();
  }

  function cancel() {
    done = true;
    valueEl.dataset.editing = "0";
    loadCustomer();
  }

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") save();
    if (ev.key === "Escape") cancel();
  });

  input.addEventListener("blur", save);
});

// ----------------------
// CHARTS & METRICS
// ----------------------
function renderRevenueTrend() {
  const canvas = document.getElementById("revenue-line-chart");
  if (!canvas || typeof Chart === "undefined") return;

  if (window.revenueChart) window.revenueChart.destroy();

  window.revenueChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: DEMO_REVENUE.labels,
      datasets: [
        {
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
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.05)" } },
        y: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.08)" } }
      }
    }
  });
}

function renderPerformanceMetrics() {
  const ordersEl = document.getElementById("metric-orders");
  const turnaroundEl = document.getElementById("metric-turnaround");
  const revenueEl = document.getElementById("metric-revenue");

  if (ordersEl) ordersEl.textContent = DEMO_PERFORMANCE.ordersFulfilled;
  if (turnaroundEl) turnaroundEl.textContent = DEMO_PERFORMANCE.avgTurnaround;
  if (revenueEl) revenueEl.textContent = `${DEMO_PERFORMANCE.revenuePercent}%`;
}

function renderPerformanceChart() {
  const canvas = document.getElementById("artist-pie-chart");
  if (!canvas || typeof Chart === "undefined") return;

  if (window.artistChart) window.artistChart.destroy();

  window.artistChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: DEMO_PERFORMANCE.artistRevenue.map((a) => a.name),
      datasets: [
        {
          data: DEMO_PERFORMANCE.artistRevenue.map((a) => a.value),
          backgroundColor: ["#4A90E2", "#50E3C2", "#B8E986"]
        }
      ]
    },
    options: { plugins: { legend: { labels: { color: "#fff" } } } }
  });
}

// ----------------------
// INVOICES
// ----------------------
function renderInvoices(invoices) {
  const container = document.getElementById("invoice-grid");
  if (!container) return;

  container.innerHTML = "";

  if (!invoices || !invoices.length) {
    container.innerHTML = `<p class="text-gray-400 text-sm">No invoices available.</p>`;
    return;
  }

  invoices.forEach((inv) => {
    const el = document.createElement("div");
    el.className = "bg-gray-800 px-4 py-3 rounded-lg border border-gray-700";

    const statusClass =
      inv.status === "PAID"
        ? "text-green-400"
        : inv.status === "OVERDUE"
          ? "text-red-400"
          : "text-blue-400";

    el.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <p class="font-semibold">${inv.invoiceNumber}</p>
          <p class="text-gray-400 text-sm">${inv.invoiceDate} → ${inv.dueDate}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">${inv.amount} ${inv.currency}</p>
          <p class="text-sm ${statusClass}">${inv.status}</p>
        </div>
      </div>
    `;

    container.appendChild(el);
  });
}

async function loadInvoices() {
  if (!customerId) return;

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
  if (!container) return;

  container.innerHTML = "";

  if (!contacts || contacts.length === 0) {
    container.innerHTML = `<p class="text-gray-400 text-sm">No contacts linked.</p>`;
    return;
  }

  const toShow = contacts.slice(0, 2);

  toShow.forEach((c) => {
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
      const btn = document.getElementById("open-contact-modal-btn");
      if (btn) btn.click();
    });

    container.appendChild(moreDiv);
  }
}

// ----------------------
// CONTACT MODAL – LIST
// ----------------------
function renderContactList() {
  const container = document.getElementById("contact-list");
  if (!container) return;

  container.innerHTML = "";

  let filtered =
    contactTab === "all"
      ? allContacts
      : allContacts.filter((c) => linkedContacts.includes(String(c.id)));

  if (contactSearchQuery.trim() !== "") {
    const q = contactSearchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }

  if (!filtered.length) {
    container.innerHTML = `<p class="text-gray-400 text-sm">No contacts found.</p>`;
    return;
  }

  filtered.forEach((c) => {
    const idStr = String(c.id);

    const div = document.createElement("label");
    div.className =
      "flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700";

    div.innerHTML = `
      <input type="checkbox" value="${idStr}"
        ${linkedContacts.includes(idStr) ? "checked" : ""}/>
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
  if (!tabAll || !tabLinked) return;

  if (contactTab === "all") {
    tabAll.className = "px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold";
    tabLinked.className =
      "px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600";
  } else {
    tabLinked.className = "px-3 py-1 rounded bg-blue-600 text-white text-sm font-semibold";
    tabAll.className =
      "px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600";
  }
}

function closeContactModal() {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ----------------------
// CONTACT MODAL – OPEN / SAVE / CREATE
// ----------------------
async function openContactModal() {
  const modal = document.getElementById("contact-modal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // 1. Load all contacts
  const allResp = await fetch(CONTACT_API);
  if (!allResp.ok) {
    console.error("Failed to load contacts:", await allResp.text());
    allContacts = [];
  } else {
    allContacts = await allResp.json();
  }

  // 2. Load customer to get linked contacts
  const custResp = await fetch(`${API_BASE}/${customerId}`);
  if (!custResp.ok) {
    console.error("Failed to load customer for contacts:", await custResp.text());
    linkedContacts = [];
  } else {
    const customer = await custResp.json();
    linkedContacts = (customer.contacts ?? []).map((c) => String(c.id));
  }

  contactTab = "all";
  highlightContactTab();
  renderContactList();
}

async function saveContacts() {
  const checkboxes = Array.from(
    document.querySelectorAll("#contact-list input[type='checkbox']")
  );

  // Keep IDs as strings (works for both numeric and "cust-1"/"cont-1" style)
  linkedContacts = checkboxes.filter((cb) => cb.checked).map((cb) => String(cb.value));

  const resp = await fetch(`${API_BASE}/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactIds: linkedContacts })
  });

  if (!resp.ok) {
    console.error("Failed to save contacts:", await resp.text());
  }

  closeContactModal();
  await loadCustomer();
}

async function createNewContact() {
  const nameEl = document.getElementById("new-contact-name");
  const emailEl = document.getElementById("new-contact-email");
  const phoneEl = document.getElementById("new-contact-phone");

  const name = (nameEl?.value ?? "").trim();
  const email = (emailEl?.value ?? "").trim();
  const phone = (phoneEl?.value ?? "").trim();

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
  const createdId = String(created.id);

  // Update in-memory
  allContacts.push(created);
  if (!linkedContacts.includes(createdId)) {
    linkedContacts.push(createdId);
  }

  // Persist link to customer
  const linkResp = await fetch(`${API_BASE}/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactIds: linkedContacts })
  });

  if (!linkResp.ok) {
    console.error("Failed to link new contact:", await linkResp.text());
  }

  // Clear inputs
  if (nameEl) nameEl.value = "";
  if (emailEl) emailEl.value = "";
  if (phoneEl) phoneEl.value = "";

  // Refresh lists
  renderContactList();
  await loadCustomer();
}

// ----------------------
// ARTISTS (children)
// ----------------------
async function loadArtists(artistIds) {
  const container = document.getElementById("artists-list");
  if (!container) return;

  container.innerHTML = "";

  if (!artistIds || !artistIds.length) {
    container.innerHTML = `<p class="text-gray-400 text-sm">No associated artists.</p>`;
    return;
  }

  // NOTE: This still calls /api/customers/{id} for each child id.
  // That matches your controller, but be aware this is "customer-as-artist" modelling.
  const artistPromises = artistIds.map((id) =>
    fetch(`${API_BASE}/${id}`).then((r) => r.json())
  );

  const artists = await Promise.all(artistPromises);

  artists.forEach((a) => {
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
  if (!customerId) return;

  const resp = await fetch(`${API_BASE}/${customerId}`);
  if (!resp.ok) {
    console.error("Could not load customer:", await resp.text());
    return;
  }

  const c = await resp.json();

  // Top title
  const titleEl = document.getElementById("customer-name-title");
  if (titleEl) titleEl.textContent = c.name ?? "";

  // Detail section
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? "-";
  };

  setText("detail-name", c.name);
  setText("detail-cvr", c.cvr);
  setText("detail-phone", c.phone);
  setText("detail-email", c.email);
  setText("detail-address", c.addressLine);
  setText("detail-postalCode", c.postalCode);

  // Contacts in sidebar (only first 2 + "x more")
  renderLinkedContacts(c.contacts ?? []);

  // Artists: show only if this is a bureau (no parent)
  const artistsSection = document.getElementById("artists-section");
  if (artistsSection) {
    if (!c.parentId) {
      artistsSection.classList.remove("hidden");
      await loadArtists(c.children ?? []);
    } else {
      artistsSection.classList.add("hidden");
    }
  }
}

// ----------------------
// INIT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  // Contact modal UI wiring
  const tabAll = document.getElementById("contact-tab-all");
  const tabLinked = document.getElementById("contact-tab-linked");
  const search = document.getElementById("contact-search");
  const openBtn = document.getElementById("open-contact-modal-btn");
  const closeBtn = document.getElementById("contact-modal-close");
  const saveBtn = document.getElementById("contact-save-btn");
  const modal = document.getElementById("contact-modal");
  const createBtn = document.getElementById("create-contact-btn");

  if (tabAll) {
    tabAll.addEventListener("click", () => {
      contactTab = "all";
      highlightContactTab();
      renderContactList();
    });
  }

  if (tabLinked) {
    tabLinked.addEventListener("click", () => {
      contactTab = "linked";
      highlightContactTab();
      renderContactList();
    });
  }

  if (search) {
    search.addEventListener("input", (e) => {
      contactSearchQuery = e.target.value;
      renderContactList();
    });
  }

  if (openBtn) openBtn.addEventListener("click", openContactModal);
  if (closeBtn) closeBtn.addEventListener("click", closeContactModal);
  if (saveBtn) saveBtn.addEventListener("click", saveContacts);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeContactModal();
    });
  }

  if (createBtn) createBtn.addEventListener("click", createNewContact);

  // Initial loads
  loadCustomer();
  loadInvoices();
  renderPerformanceMetrics();
  renderPerformanceChart();
  renderRevenueTrend();
});
