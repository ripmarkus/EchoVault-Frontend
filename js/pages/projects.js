const API_BASE = "http://localhost:8080/api/projects";
const CUSTOMERS_API_BASE = "http://localhost:8080/api/customers";

let allProjects = [];
let allCustomers = [];

// Cache implementation with Map for projects list
let projectsCache = new Map();
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to check if cache is valid
function isCacheValid() {
  return cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

// Function to get projects from cache or fetch from API
async function getProjectsFromCacheOrAPI() {
  if (isCacheValid() && projectsCache.size > 0) {
    console.log("Using cached projects data");
    return Array.from(projectsCache.values());
  }
  
  console.log("Fetching fresh projects data from API");
  return await fetchProjectsFromAPI();
}

// Function to fetch projects from API and update cache
async function fetchProjectsFromAPI() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const projectsData = await response.json();
    
    // Clear existing cache
    projectsCache.clear();
    
    // Convert Map response to array and update cache
    let projectsArray;
    if (typeof projectsData === 'object' && !Array.isArray(projectsData)) {
      projectsArray = Object.values(projectsData);
      // Also populate the Map cache
      Object.entries(projectsData).forEach(([key, project]) => {
        projectsCache.set(parseInt(key), project);
      });
    } else {
      projectsArray = projectsData;
      // Populate Map cache from array
      projectsArray.forEach(project => {
        projectsCache.set(project.id, project);
      });
    }
    
    // Update cache timestamp
    cacheTimestamp = Date.now();
    
    return projectsArray;
  } catch (error) {
    console.error("Error fetching projects from API:", error);
    throw error;
  }
}

// Filter state
let currentFilters = {
  customer: "",
  status: "",
  startDate: "",
  endDate: ""
};

// Render projects table
function renderProjects(projects) {
  const tableBody = document.getElementById("projects-table-body");
  tableBody.innerHTML = "";

  projects.forEach((project) => {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-700 hover:bg-gray-700/60 transition-colors cursor-pointer";
    
    // Make entire row clickable to navigate to project detail
    row.addEventListener("click", (e) => {
      // Don't navigate if clicking on buttons or checkboxes
      if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
        return;
      }
      window.location.href = `project.html?id=${project.id}`;
    });

    // Format dates
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString() : "-";
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString() : "-";
    const usageStartDate = project.usageStartDate ? new Date(project.usageStartDate).toLocaleDateString() : "-";
    const usageEndDate = project.usageEndDate ? new Date(project.usageEndDate).toLocaleDateString() : "-";

    // Status styling
    const statusClass = getStatusClass(project.status);

    // Match table headers: ID, Name, Customer, Contact Person, Status, Rental Start Date, Rental End Date, Usage Start Date, Usage End Date
    row.innerHTML = `
      <td class="p-4 text-left font-medium">${project.id}</td>
      <td class="p-4 text-left">${project.name || `Project ${project.id}`}</td>
      <td class="p-4 text-left">${project.customer?.name || "-"}</td>
      <td class="p-4 text-left">${project.customer?.contactPerson || project.contactPerson || "-"}</td>
      <td class="p-4 text-left">
        <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
          ${project.status || "UNKNOWN"}
        </span>
      </td>
      <td class="p-4 text-left">${startDate}</td>
      <td class="p-4 text-left">${endDate}</td>
      <td class="p-4 text-left">${usageStartDate}</td>
      <td class="p-4 text-left">${usageEndDate}</td>
    `;

    tableBody.appendChild(row);
  });
}

// Get CSS class for project status
function getStatusClass(status) {
  switch (status?.toUpperCase()) {
    case "REQUESTED":
      return "bg-yellow-500 text-white";
    case "IN_PROGRESS":
      return "bg-blue-500 text-white";
    case "COMPLETED":
      return "bg-green-500 text-white";
    case "CANCELLED":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

// Open filter modal
function openFilterModal() {
  const modal = document.getElementById("status-form-modal");
  const titleEl = document.getElementById("status-form-title");
  
  titleEl.textContent = "Filter Projects";
  
  // Populate customer dropdown
  populateCustomerDropdown();
  
  // Set current filter values
  document.getElementById("form-customer").value = currentFilters.customer;
  document.getElementById("form-status").value = currentFilters.status;
  document.getElementById("form-startDate").value = currentFilters.startDate;
  document.getElementById("form-endDate").value = currentFilters.endDate;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Populate customer dropdown
function populateCustomerDropdown() {
  const select = document.getElementById("form-customer");
  if (!select) return;

  select.innerHTML = "";

  // Add "All customers" option
  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "All customers";
  select.appendChild(allOpt);

  // Add customer options
  allCustomers.forEach((customer) => {
    const opt = document.createElement("option");
    opt.value = customer.id;
    opt.textContent = customer.name;
    select.appendChild(opt);
  });
}

// Apply filters
function applyFilters(e) {
  e.preventDefault();

  // Get filter values
  currentFilters.customer = document.getElementById("form-customer").value;
  currentFilters.status = document.getElementById("form-status").value;
  currentFilters.startDate = document.getElementById("form-startDate").value;
  currentFilters.endDate = document.getElementById("form-endDate").value;

  // Filter projects
  let filteredProjects = allProjects;

  if (currentFilters.customer) {
    filteredProjects = filteredProjects.filter(p => 
      p.customer?.id == currentFilters.customer
    );
  }

  if (currentFilters.status) {
    filteredProjects = filteredProjects.filter(p => 
      p.status === currentFilters.status
    );
  }

  if (currentFilters.startDate) {
    filteredProjects = filteredProjects.filter(p => {
      if (!p.startDate) return false;
      return new Date(p.startDate) >= new Date(currentFilters.startDate);
    });
  }

  if (currentFilters.endDate) {
    filteredProjects = filteredProjects.filter(p => {
      if (!p.endDate) return false;
      return new Date(p.endDate) <= new Date(currentFilters.endDate);
    });
  }

  renderProjects(filteredProjects);
  closeFilterModal();
}

// Close filter modal
function closeFilterModal() {
  const modal = document.getElementById("status-form-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// Load projects from API using cache
async function loadProjects() {
  try {
    const projects = await getProjectsFromCacheOrAPI();
    allProjects = projects;
    renderProjects(allProjects);
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}

// Load customers from API
async function loadCustomers() {
  try {
    const resp = await fetch(CUSTOMERS_API_BASE);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const customers = await resp.json();
    allCustomers = customers;
  } catch (err) {
    console.error("Error loading customers:", err);
  }
}

// Search projects using cache when possible
async function loadProjectSearch(query = "") {
  try {
    let projects;
    
    if (!query && isCacheValid()) {
      // No query and cache is valid, use cached data
      projects = Array.from(projectsCache.values());
    } else {
      // Search query or cache is invalid, fetch from API
      const url = query ? `${API_BASE}?q=${encodeURIComponent(query)}` : API_BASE;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const projectsData = await response.json();
      
      // Convert to array
      if (typeof projectsData === 'object' && !Array.isArray(projectsData)) {
        projects = Object.values(projectsData);
      } else {
        projects = projectsData;
      }
      
      // Update cache if no search query
      if (!query) {
        projectsCache.clear();
        projects.forEach(project => {
          projectsCache.set(project.id, project);
        });
        cacheTimestamp = Date.now();
      }
    }
    
    allProjects = projects;
    renderProjects(projects);
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

// Placeholder functions for edit and delete
function openProjectFormModalForEdit(id) {
  console.log("Edit project:", id);
  // TODO: Implement edit functionality
}

function handleDeleteProject(id) {
  console.log("Delete project:", id);
  // TODO: Implement delete functionality
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Load data
  loadProjects();
  loadCustomers();

  // Get DOM elements
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const filterBtn = document.getElementById("manage-status-btn");
  const filterModal = document.getElementById("status-form-modal");
  const filterModalClose = document.getElementById("status-form-close");
  const filterModalCancel = document.getElementById("status-form-cancel");
  const filterForm = document.getElementById("status-form");

  // Search functionality
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      loadProjectSearch(query);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loadProjectSearch(searchInput.value.trim());
      }
    });
  }

  // Filter button - update text to "Filter"
  if (filterBtn) {
    filterBtn.textContent = "Filter";
    filterBtn.addEventListener("click", () => {
      openFilterModal();
    });
  }

  // Filter modal close
  if (filterModal && filterModalClose && filterModalCancel) {
    const close = () => closeFilterModal();

    filterModalClose.addEventListener("click", close);
    filterModalCancel.addEventListener("click", close);

    filterModal.addEventListener("click", (e) => {
      if (e.target === filterModal) {
        closeFilterModal();
      }
    });
  }

  // Filter form submit
  if (filterForm) {
    filterForm.addEventListener("submit", applyFilters);
  }

  // ESC key closes modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (filterModal && !filterModal.classList.contains("hidden")) {
        closeFilterModal();
      }
    }
  });
});