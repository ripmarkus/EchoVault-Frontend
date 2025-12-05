const API_BASE = "http://localhost:8080/api/customers";

async function loadCustomers() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const customers = await response.json();

    const tableBody = document.getElementById("customers-table-body");
    tableBody.innerHTML = "";

    customers.forEach((customer) => {
      const row = document.createElement("tr");
      row.classList.add("border-b", "border-gray-700", "hover:bg-gray-700");

      row.innerHTML = `
        <td class="p-7"><input type="checkbox" value="${customer.id}" /></td>
        <td class="p-7">${customer.id}</td>
        <td class="p-7">${customer.name}</td>
        <td class="p-7">${customer.cvr}</td>
        <td class="p-7">${customer.address}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

async function loadCustomerSearch(query = "") {
  try {
    const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const customers = await response.json();
    const tableBody = document.getElementById("customers-table-body");
    tableBody.innerHTML = "";

    customers.forEach((c) => {
      const row = document.createElement("tr");
      row.classList.add("border-b", "border-gray-700", "hover:bg-gray-700");
      row.innerHTML = `
        <td class="p-7"><input type="checkbox" value="${c.id}" /></td>
        <td class="p-7">${c.id}</td>
        <td class="p-7">${c.name}</td>
        <td class="p-7">${c.cvr}</td>
        <td class="p-7">${c.address}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading customers:", err);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Load all initially
  loadCustomers();

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  if (searchBtn && searchInput) {
    // Klik på knap → brug loadCustomerSearch
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      loadCustomerSearch(query);
    });

    // Enter i input → også loadCustomerSearch
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loadCustomerSearch(searchInput.value.trim());
      }
    });
  }
});
