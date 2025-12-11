// Project data from API
let projectData = null;
const API_BASE = "http://localhost:8080/api/projects";

// Cache for individual project data
let projectCache = new Map();
let projectCacheTimestamp = new Map();
const PROJECT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get project ID from URL parameters
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

if (!projectId) {
    console.error("Missing ?id=project-X");
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-edit-field]");
    if (!btn) return;

    const field = btn.dataset.editField;
    let valueEl;
    
    // Map field to the correct element ID
    switch(field) {
        case 'projectManager':
            valueEl = document.getElementById("project-manager");
            break;
        case 'projectType':
            valueEl = document.getElementById("project-type");
            break;
        case 'status':
            valueEl = document.getElementById("project-phase");
            break;
        case 'startDate':
            valueEl = document.getElementById("project-rental-start");
            break;
        case 'endDate':
            valueEl = document.getElementById("project-rental-end");
            break;
        case 'usageStartDate':
            valueEl = document.getElementById("project-usage-start");
            break;
        case 'usageEndDate':
            valueEl = document.getElementById("project-usage-end");
            break;
        default:
            return;
    }

    if (!valueEl) return;

    // Create input
    const oldValue = valueEl.textContent.trim();
    let input;
    
    // For project manager field, create a user selection interface
    if (field === 'projectManager') {
        // Create a select dropdown with users loaded from API
        input = document.createElement("select");
        input.className = "px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full";
        
        // Load users and populate dropdown
        loadUsersForDropdown(input, oldValue);
    } else if (field === 'status') {
        input = document.createElement("select");
        input.innerHTML = `
            <option value="REQUESTED">REQUESTED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
        `;
        input.value = oldValue;
    } else if (field === 'startDate' || field === 'endDate' || field === 'usageStartDate' || field === 'usageEndDate') {
        input = document.createElement("input");
        input.type = "date";
        // Convert EU format (dd.MM.yyyy) to ISO format (yyyy-MM-dd) for date input
        const isoDate = convertEUToISO(oldValue);
        input.value = isoDate || '';
    } else {
        input = document.createElement("input");
        input.value = oldValue !== 'N/A' && oldValue !== 'Not assigned' ? oldValue : '';
    }
    
    input.className = "px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full";

    // Replace text with input
    valueEl.replaceWith(input);
    input.focus();

    // Save on Enter or blur
    async function save() {
        let newValue = input.value.trim();
        
        // Handle different field types
        if (field === 'projectManager') {
            // For project manager, send the user ID
            const userId = input.value ? parseInt(input.value) : null;
            const updateData = { projectManager: userId ? { id: userId } : null };
            
            try {
                await fetch(`${API_BASE}/${projectId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData)
                });
                await loadProjectData(projectId);
            } catch (error) {
                console.error("Error updating project:", error);
                alert("Failed to update project");
            }
            return;
        } else if (field === 'startDate' || field === 'endDate' || field === 'usageStartDate' || field === 'usageEndDate') {
            // For dates, ensure we send in ISO format
            newValue = newValue || null;
        }

        try {
            await fetch(`${API_BASE}/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: newValue })
            });

            // Reload project info
            await loadProjectData(projectId);
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to update project");
        }
    }

    input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") save();
    });

    input.addEventListener("blur", save);
});

// Function to check if individual project cache is valid
function isProjectCacheValid(projectId) {
  const timestamp = projectCacheTimestamp.get(projectId);
  return timestamp && (Date.now() - timestamp) < PROJECT_CACHE_DURATION;
}

// Function to get project from cache or fetch from API
async function getProjectFromCacheOrAPI(projectId) {
  if (isProjectCacheValid(projectId) && projectCache.has(projectId)) {
    console.log(`Using cached project data for ID: ${projectId}`);
    return projectCache.get(projectId);
  }
  
  console.log(`Fetching fresh project data for ID: ${projectId}`);
  return await fetchProjectFromAPI(projectId);
}

// Function to fetch project from API and update cache
async function fetchProjectFromAPI(projectId) {
  const response = await fetch(`${API_BASE}/${projectId}`);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const project = await response.json();
  
  // Update cache
  projectCache.set(projectId, project);
  projectCacheTimestamp.set(projectId, Date.now());
  
  return project;
}

// Function to get project ID from URL parameters
function getProjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to load project data from API
async function loadProjectData(projectId) {
    try {
        projectData = await getProjectFromCacheOrAPI(projectId);
        populateProjectInfo();
        await loadProjectRelatedData();
    } catch (error) {
        console.error("Error loading project data:", error);
        // Fall back to example data if API fails
        loadExampleData();
    }
}

// Function to populate project info from API data
function populateProjectInfo() {
    if (!projectData) return;
    
    document.getElementById("project-title").textContent = `Project ${projectData.id}`;
    document.getElementById("project-manager").textContent = projectData.projectManager ? projectData.projectManager.name : "Not assigned"; 
    document.getElementById("project-type").textContent = projectData.projectType || "Rental"; 
    document.getElementById("project-phase").textContent = projectData.status || "Unknown";
    document.getElementById("project-total").textContent = "N/A"; // Not in API model
    document.getElementById("project-confirmation-date").textContent = formatDateToEU(projectData.startDate) || "N/A";
    document.getElementById("project-rental-start").textContent = formatDateToEU(projectData.startDate) || "N/A";
    document.getElementById("project-rental-end").textContent = formatDateToEU(projectData.endDate) || "N/A";
    document.getElementById("project-usage-start").textContent = formatDateToEU(projectData.usageStartDate) || "N/A";
    document.getElementById("project-usage-end").textContent = formatDateToEU(projectData.usageEndDate) || "N/A";
    
    // Update Gantt chart
    updateGanttChart();
}

// Format date to EU format (dd.MM.yyyy)
function formatDateToEU(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK'); // Danish locale gives dd.MM.yyyy format
}

// Convert EU format (dd.MM.yyyy) to ISO format (yyyy-MM-dd)
function convertEUToISO(euDateString) {
    if (!euDateString || euDateString === 'N/A' || euDateString === 'Not assigned') return null;
    
    // Handle different possible formats
    let parts;
    if (euDateString.includes('.')) {
        parts = euDateString.split('.');
    } else if (euDateString.includes('-')) {
        // Already in ISO format
        return euDateString;
    } else {
        return null;
    }
    
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    
    return null;
}

// Load users for dropdown in inline editing
async function loadUsersForDropdown(selectElement, currentValue) {
    try {
        const response = await fetch('http://localhost:8080/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const users = await response.json();
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Not assigned';
        selectElement.appendChild(defaultOption);
        
        // Add user options
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            
            // Select current user if matches
            if (user.name === currentValue) {
                option.selected = true;
            }
            
            selectElement.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        // Add fallback text input
        const textInput = document.createElement('input');
        textInput.value = currentValue;
        textInput.className = selectElement.className;
        selectElement.parentNode.replaceChild(textInput, selectElement);
    }
}

// Update Gantt chart with project data
function updateGanttChart() {
    if (!projectData) return;
    
    const rentalStart = projectData.startDate ? new Date(projectData.startDate) : null;
    const rentalEnd = projectData.endDate ? new Date(projectData.endDate) : null;
    const usageStart = projectData.usageStartDate ? new Date(projectData.usageStartDate) : null;
    const usageEnd = projectData.usageEndDate ? new Date(projectData.usageEndDate) : null;
    
    // Calculate timeline range
    const timelineRange = calculateTimelineRange(rentalStart, rentalEnd, usageStart, usageEnd);
    
    // Update timeline header with dynamic dates
    updateTimelineHeader(timelineRange.start, timelineRange.end);
    
    // Update rental period
    if (rentalStart && rentalEnd) {
        const rentalPosition = calculateBarPosition(rentalStart, rentalEnd, timelineRange);
        updatePeriodBar('rental-period-bar', rentalPosition);
        const rentalPeriodText = document.getElementById("rental-period-text");
        if (rentalPeriodText) {
            rentalPeriodText.textContent = 
                `${formatDateToEU(projectData.startDate)} - ${formatDateToEU(projectData.endDate)}`;
        }
    } else {
        const rentalBar = document.getElementById("rental-period-bar");
        const rentalPeriodText = document.getElementById("rental-period-text");
        if (rentalBar) rentalBar.style.display = "none";
        if (rentalPeriodText) rentalPeriodText.textContent = "Not set";
    }
    
    // Update usage period
    if (usageStart && usageEnd) {
        const usagePosition = calculateBarPosition(usageStart, usageEnd, timelineRange);
        updatePeriodBar('usage-period-bar', usagePosition);
        const usagePeriodText = document.getElementById("usage-period-text");
        if (usagePeriodText) {
            usagePeriodText.textContent = 
                `${formatDateToEU(projectData.usageStartDate)} - ${formatDateToEU(projectData.usageEndDate)}`;
        }
    } else {
        const usageBar = document.getElementById("usage-period-bar");
        const usagePeriodText = document.getElementById("usage-period-text");
        if (usageBar) usageBar.style.display = "none";
        if (usagePeriodText) usagePeriodText.textContent = "Not set";
    }
}

// Calculate the optimal timeline range based on project dates
function calculateTimelineRange(rentalStart, rentalEnd, usageStart, usageEnd) {
    const allDates = [rentalStart, rentalEnd, usageStart, usageEnd].filter(date => date !== null);
    
    if (allDates.length === 0) {
        // Default to current month if no dates
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
    }
    
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    // Add padding before and after
    const padding = Math.max(7, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) * 0.2); // 20% padding or min 7 days
    
    const start = new Date(minDate);
    start.setDate(start.getDate() - padding);
    
    const end = new Date(maxDate);
    end.setDate(end.getDate() + padding);
    
    return { start, end };
}

// Update timeline header with dynamic dates
function updateTimelineHeader(startDate, endDate) {
    const headerContainer = document.querySelector('#gantt-chart .grid-cols-10');
    if (!headerContainer) return;
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const interval = Math.max(1, Math.floor(totalDays / 10));
    
    headerContainer.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i * interval));
        
        const div = document.createElement('div');
        div.className = 'text-center text-xs relative';
        div.textContent = formatDateShort(currentDate);
        headerContainer.appendChild(div);
    }
}

// Format date for timeline header (shorter format)
function formatDateShort(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
}

// Calculate precise bar position and width
function calculateBarPosition(startDate, endDate, timelineRange) {
    const totalDuration = timelineRange.end - timelineRange.start;
    const startOffset = startDate - timelineRange.start;
    const duration = endDate - startDate;
    
    const leftPercent = Math.max(0, Math.min(100, (startOffset / totalDuration) * 100));
    const widthPercent = Math.max(1, Math.min(100 - leftPercent, (duration / totalDuration) * 100));
    
    return {
        left: leftPercent,
        width: widthPercent
    };
}

// Update period bar styling
function updatePeriodBar(elementId, position) {
    const bar = document.getElementById(elementId);
    if (!bar) return;
    
    bar.style.display = 'block';
    bar.style.left = `${position.left}%`;
    bar.style.width = `${position.width}%`;
    
    // Add minimum width for visibility
    if (position.width < 5) {
        bar.style.minWidth = '20px';
    }
}

// Enhanced example timeline update
function updateExampleGanttChart() {
    // Create example dates
    const today = new Date();
    const rentalStart = new Date(today);
    rentalStart.setDate(today.getDate() + 5);
    
    const rentalEnd = new Date(rentalStart);
    rentalEnd.setDate(rentalStart.getDate() + 14);
    
    const usageStart = new Date(rentalStart);
    usageStart.setDate(rentalStart.getDate() + 2);
    
    const usageEnd = new Date(rentalEnd);
    usageEnd.setDate(rentalEnd.getDate() - 2);
    
    // Calculate timeline
    const timelineRange = calculateTimelineRange(rentalStart, rentalEnd, usageStart, usageEnd);
    updateTimelineHeader(timelineRange.start, timelineRange.end);
    
    // Update bars
    const rentalPosition = calculateBarPosition(rentalStart, rentalEnd, timelineRange);
    const usagePosition = calculateBarPosition(usageStart, usageEnd, timelineRange);
    
    updatePeriodBar('rental-period-bar', rentalPosition);
    updatePeriodBar('usage-period-bar', usagePosition);
    
    // Update text displays - check if elements exist
    const rentalPeriodText = document.getElementById("rental-period-text");
    const usagePeriodText = document.getElementById("usage-period-text");
    
    if (rentalPeriodText) {
        rentalPeriodText.textContent = 
            `${formatDateToEU(rentalStart.toISOString().split('T')[0])} - ${formatDateToEU(rentalEnd.toISOString().split('T')[0])}`;
    }
    
    if (usagePeriodText) {
        usagePeriodText.textContent = 
            `${formatDateToEU(usageStart.toISOString().split('T')[0])} - ${formatDateToEU(usageEnd.toISOString().split('T')[0])}`;
    }
}

// Function to load related data (customers, contacts, etc.)
async function loadProjectRelatedData() {
    try {
        // Load real customer and contact data if project has customer
        if (projectData && projectData.customer) {
            await loadRealCustomerData(projectData.customer);
        } else {
            // Fall back to example data
            loadExampleRelatedData();
        }
    } catch (error) {
        console.error("Error loading project related data:", error);
        // Fall back to example data
        loadExampleRelatedData();
    }
}

// Function to load real customer data from API
async function loadRealCustomerData(customerData) {
    try {
        // Use customer data from project
        const customers = [customerData];
        
        // Load contacts for the customer
        let contacts = [];
        if (customerData.id) {
            try {
                const contactsResponse = await fetch(`http://localhost:8080/api/customers/${customerData.id}/contacts`);
                if (contactsResponse.ok) {
                    contacts = await contactsResponse.json();
                }
            } catch (error) {
                console.log("No contacts endpoint available, using customer contact person");
                // If no contacts endpoint, create contact from customer contact person
                if (customerData.contactPerson) {
                    contacts = [{
                        name: customerData.contactPerson,
                        role: "Contact Person",
                        email: customerData.email || "",
                        phone: customerData.phone || ""
                    }];
                }
            }
        }
        
        // For now, use example data for orders and activities
        const orders = [
            { name: "Event Setup", totalPrice: "$500", usagePeriod: "1 Week", status: "Pending" },
            { name: "Sound System Rental", totalPrice: "$1200", usagePeriod: "3 Days", status: "Completed" },
        ];
        
        renderCustomers(customers);
        renderContacts(contacts);
        renderOrders(orders);
        
    } catch (error) {
        console.error("Error loading real customer data:", error);
        loadExampleRelatedData();
    }
}

// Function to load example data (fallback or for related entities not yet implemented)
function loadExampleData() {
    loadExampleRelatedData();
    
    // Example project info if API fails
    const exampleProjectInfo = {
        projectName: "Example Project",
        projectTotal: "22937,4 kr",
        projectManager: "Hjalte Larsen",
        confirmationDate: "10.12.2025",
        type: "Rental",
        phase: "Planning",
        rentalStartDate: "10.12.2025",
        rentalEndDate: "20.12.2025",
        usageStartDate: "11.12.2025",
        usageEndDate: "19.12.2025",
    };
    
    document.getElementById("project-title").textContent = exampleProjectInfo.projectName;
    document.getElementById("project-manager").textContent = exampleProjectInfo.projectManager;
    document.getElementById("project-type").textContent = exampleProjectInfo.type;
    document.getElementById("project-phase").textContent = exampleProjectInfo.phase;
    document.getElementById("project-total").textContent = exampleProjectInfo.projectTotal;
    document.getElementById("project-confirmation-date").textContent = exampleProjectInfo.confirmationDate;
    document.getElementById("project-rental-start").textContent = exampleProjectInfo.rentalStartDate;
    document.getElementById("project-rental-end").textContent = exampleProjectInfo.rentalEndDate;
    document.getElementById("project-usage-start").textContent = exampleProjectInfo.usageStartDate;
    document.getElementById("project-usage-end").textContent = exampleProjectInfo.usageEndDate;
    
    // Update Gantt chart with enhanced example timeline
    updateExampleGanttChart();
}

function loadExampleRelatedData() {
    // Example data for related entities
    const customers = [
        { name: "All Things Live", role: "Agency", photo: "../imgs/project/atl.jpg" },
        { name: "Dj Aligator", role: "Artist", photo: "../imgs/project/Book_DJ_Aligator_Stor-scaled.jpg" },
    ];

    const contacts = [
        { name: "Mikkel Glenstrup", role: "Agent", email: "mikkel@atl.dk", phone: "+45 20 20 20 20" },
    ];

    const orders = [
        { name: "Event Setup", totalPrice: "$500", usagePeriod: "1 Week", status: "Pending" },
        { name: "Sound System Rental", totalPrice: "$1200", usagePeriod: "3 Days", status: "Completed" },
    ];
    
    renderCustomers(customers);
    renderContacts(contacts);
    renderOrders(orders);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const customersList = document.getElementById("customers-list");
    const contactList = document.getElementById("contact-list");
    const ordersList = document.getElementById("orders-list");
    const equipmentList = document.getElementById("equipment-list");

    // Tab elements
    const orderSummaryTab = document.getElementById("order-summary-tab");
    const equipmentTab = document.getElementById("equipment-tab");
    const orderSummaryContent = document.getElementById("order-summary-content");
    const equipmentContent = document.getElementById("equipment-content");
    const rightColumn = document.getElementById("right-column");
    const mainGrid = document.getElementById("main-grid");
    
    const projectId = getProjectIdFromURL();
    
    if (projectId) {
        loadProjectData(projectId);
    } else {
        // No project ID in URL, load example data
        loadExampleData();
    }
    
    setupTabFunctionality(orderSummaryTab, equipmentTab, orderSummaryContent, equipmentContent, rightColumn);
    setupEditButton();
});

function setupEditButton() {
    const editBtn = document.getElementById("edit-project-btn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            // Navigate to edit page or open edit modal
            const projectId = getProjectIdFromURL();
            if (projectId) {
                // You can implement edit functionality here
                console.log("Edit project:", projectId);
                // Example: window.location.href = `edit-project.html?id=${projectId}`;
            }
        });
    }
}

function setupTabFunctionality(orderSummaryTab, equipmentTab, orderSummaryContent, equipmentContent, rightColumn) {
    if (!orderSummaryTab || !equipmentTab || !orderSummaryContent || !equipmentContent || !rightColumn) {
        return; // Exit if any required elements are missing
    }

// Tab functionality
function switchTab(activeTab, activeContent) {
    // Reset all tabs to inactive state
    [orderSummaryTab, equipmentTab].forEach(tab => {
        tab.className = "tab-button px-4 py-2 text-gray-400 hover:text-blue-400 font-semibold";
    });
    
    // Hide all content
    [orderSummaryContent, equipmentContent].forEach(content => {
        content.classList.add("hidden");
    });
    
    // Activate selected tab and content
    activeTab.className = "tab-button px-4 py-2 text-blue-400 border-b-2 border-blue-400 font-semibold";
    activeContent.classList.remove("hidden");
    
    // Handle layout transitions
    if (activeContent === equipmentContent) {
        // Equipment tab: hide right column and expand middle column
        rightColumn.style.display = "none";
        document.getElementById("middle-column").style.gridColumn = "2 / 4"; // span from column 2 to 4
    } else {
        // Order Summary tab: show right column and reset middle column
        rightColumn.style.display = "block";
        document.getElementById("middle-column").style.gridColumn = "auto";
    }
}

    // Tab event listeners
    orderSummaryTab.addEventListener("click", () => {
        switchTab(orderSummaryTab, orderSummaryContent);
    });

    equipmentTab.addEventListener("click", () => {
        switchTab(equipmentTab, equipmentContent);
    });
}

// Helper function to pick tag color based on role
function getTagColor(role) {
    role = role.toLowerCase();
    if (role === "artist") return "bg-green-500";
    if (role === "agency" || role === "agent" || role === "booking") return "bg-purple-500";
    return "bg-gray-500";
}

// ---------- Customers ----------
function renderCustomers(customers) {
    const customersList = document.getElementById("customers-list");
    if (!customersList) return;
    customersList.innerHTML = '';
    
    customers.forEach(customer => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex items-center gap-4 border border-gray-400";

        const photoContainer = document.createElement("div");
        photoContainer.className = "w-[82px] h-[82px] rounded-full overflow-hidden flex-shrink-0 bg-gray-600 flex items-center justify-center";
        
        if (customer.photo) {
            const img = document.createElement("img");
            img.src = customer.photo;
            img.alt = customer.name;
            img.className = "w-full h-full object-cover scale-125";
            photoContainer.appendChild(img);
        } else {
            // Default avatar with initials
            const initials = document.createElement("span");
            initials.textContent = customer.name ? customer.name.charAt(0).toUpperCase() : "?";
            initials.className = "text-white font-semibold text-sm";
            photoContainer.appendChild(initials);
        }

        const info = document.createElement("div");
        info.className = "flex flex-col space-y-1";
        
        const name = document.createElement("a");
        name.textContent = customer.name || "Unknown Customer";
        name.href = "#";
        name.className = "text-2xl text-blue-400 font-semibold hover:underline";
        
        const tag = document.createElement("span");
        tag.textContent = customer.role || customer.type || "Customer";
        tag.className = `text-xs font-medium ${getTagColor(customer.role || customer.type || "customer")} text-white px-2 py-1 rounded-full w-max`;
        
        info.appendChild(name);
        info.appendChild(tag);

        card.appendChild(photoContainer);
        card.appendChild(info);
        customersList.appendChild(card);
    });
}

// ---------- Contacts ----------
function renderContacts(contacts) {
    const contactList = document.getElementById("contact-list");
    if (!contactList) return;
    contactList.innerHTML = '';
    
    if (contacts.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "text-gray-400 text-sm text-center py-4";
        emptyState.textContent = "No contacts available";
        contactList.appendChild(emptyState);
        return;
    }
    
    contacts.forEach(contact => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex items-start gap-4 border border-gray-400";

        const info = document.createElement("div");
        info.className = "flex flex-col space-y-2";

        const nameTagRow = document.createElement("div");
        nameTagRow.className = "flex items-center gap-4";

        const name = document.createElement("a");
        name.textContent = contact.name || "Unknown Contact";
        name.href = "#";
        name.className = "text-2xl text-blue-400 font-semibold hover:underline";

        const tag = document.createElement("span");
        tag.textContent = contact.role || "Contact";
        tag.className = `text-xs font-medium ${getTagColor(contact.role || "contact")} text-white px-2 py-1 rounded-full w-max mt-1`;

        nameTagRow.appendChild(name);
        nameTagRow.appendChild(tag);

        info.appendChild(nameTagRow);

        // Only add email if it exists and is not empty
        if (contact.email && contact.email.trim()) {
            const email = document.createElement("a");
            email.textContent = contact.email;
            email.href = `mailto:${contact.email}`;
            email.className = "text-sm text-gray-400 font-semibold";
            info.appendChild(email);
        }

        // Only add phone if it exists and is not empty
        if (contact.phone && contact.phone.trim()) {
            const phone = document.createElement("p");
            phone.textContent = contact.phone;
            phone.className = "text-sm text-gray-400 font-semibold";
            info.appendChild(phone);
        }

        card.appendChild(info);
        contactList.appendChild(card);
    });
}

// ---------- Orders ----------
function renderOrders(orders) {
    const ordersList = document.getElementById("orders-list");
    if (!ordersList) return;
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "text-gray-400 text-sm text-center py-4";
        emptyState.textContent = "No orders available";
        ordersList.appendChild(emptyState);
        return;
    }
    
    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex flex-col gap-2 border border-gray-400";

        const name = document.createElement("p");
        name.textContent = `Name: ${order.name || "Unnamed Order"}`;
        name.className = "text-lg font-semibold text-white";

        const price = document.createElement("p");
        price.textContent = `Total Price: ${order.totalPrice || "N/A"}`;
        price.className = "text-sm text-gray-400";

        const period = document.createElement("p");
        period.textContent = `Usage Period: ${order.usagePeriod || "N/A"}`;
        period.className = "text-sm text-gray-400";

        const status = document.createElement("span");
        status.textContent = order.status || "Unknown";
        status.className = "text-xs font-medium bg-green-500 text-white px-2 py-1 rounded-full w-max";

        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(period);
        card.appendChild(status);

        ordersList.appendChild(card);
    });
}


