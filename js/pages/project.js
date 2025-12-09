import { showSkeleton, hideSkeleton, simulateLoading } from '../util/skeleton.js';
import { updateGanttChart, updateExampleGanttChart } from './gantt.js';

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

// Inline editing functionality
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

    function cancel() {
        valueEl.innerHTML = oldValue;
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            save();
        } else if (e.key === "Escape") {
            cancel();
        }
    });

    input.addEventListener("blur", save);

    valueEl.innerHTML = "";
    valueEl.appendChild(input);
    input.focus();
});

// API Functions
async function loadProjectData(id) {
    if (!id) {
        loadExampleData();
        return;
    }

    // Check cache first
    if (projectCache.has(id)) {
        const cached = projectCache.get(id);
        const timestamp = projectCacheTimestamp.get(id);
        
        if (timestamp && (Date.now() - timestamp) < PROJECT_CACHE_DURATION) {
            projectData = cached;
            populateProjectInfo();
            loadProjectRelatedData();
            return;
        }
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        projectData = await response.json();
        
        // Update cache
        projectCache.set(id, projectData);
        projectCacheTimestamp.set(id, Date.now());
        
        populateProjectInfo();
        loadProjectRelatedData();
    } catch (error) {
        console.error("Error loading project data:", error);
        loadExampleData();
    }
}

// Function to populate project info from API data
function populateProjectInfo() {
    if (!projectData) return;
    
    const projectTitle = projectData.name || `Project ${projectData.id}`;
    document.getElementById("project-title").textContent = projectTitle;
    document.querySelector('.project-title').textContent = `EchoVault - ${projectTitle}`;
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
    updateGanttChart(projectData, formatDateToEU);
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

// Function to load related data (customers, contacts, etc.)
function loadProjectRelatedData() {
    // For now, use example data for related entities
    // In a full implementation, you would fetch customers, contacts, orders, and activities from their respective APIs
    loadExampleRelatedData();
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
    updateExampleGanttChart(formatDateToEU);
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

    const activities = [
        { heading: "Meeting with Client", subtext: "Discuss event details", date: "2025-12-10" },
        { heading: "Venue Inspection", subtext: "Check sound setup", date: "2025-12-12" },
    ];
    
    renderCustomers(customers);
    renderContacts(contacts);
    renderOrders(orders);
    renderActivities(activities);
}

// Get DOM elements
const customersList = document.getElementById("customers-list");
const contactList = document.getElementById("contact-list");
const ordersList = document.getElementById("orders-list");
const activitiesList = document.getElementById("activities-list");

// ---------- Customers ----------
function renderCustomers(customers) {
    hideSkeleton(customersList);
    customersList.innerHTML = '';
    
    customers.forEach(cust => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex items-center gap-4 border border-gray-400";

        const img = document.createElement("img");
        img.src = cust.photo;
        img.alt = cust.name;
        img.className = "w-14 h-14 rounded-full object-cover";

        const content = document.createElement("div");

        const name = document.createElement("p");
        name.textContent = cust.name;
        name.className = "text-lg font-semibold text-white";

        const role = document.createElement("p");
        role.textContent = cust.role;
        role.className = "text-sm text-gray-400";

        content.appendChild(name);
        content.appendChild(role);

        card.appendChild(img);
        card.appendChild(content);

        customersList.appendChild(card);
    });
}

// ---------- Contacts ----------
function renderContacts(contacts) {
    hideSkeleton(contactList);
    contactList.innerHTML = '';
    
    contacts.forEach(contact => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 border border-gray-400";

        const name = document.createElement("p");
        name.textContent = contact.name;
        name.className = "text-lg font-semibold text-white mb-1";

        const role = document.createElement("p");
        role.textContent = contact.role;
        role.className = "text-sm text-gray-400 mb-2";

        const email = document.createElement("p");
        email.textContent = contact.email;
        email.className = "text-sm text-blue-400";

        const phone = document.createElement("p");
        phone.textContent = contact.phone;
        phone.className = "text-sm text-gray-300";

        card.appendChild(name);
        card.appendChild(role);
        card.appendChild(email);
        card.appendChild(phone);

        contactList.appendChild(card);
    });
}

// ---------- Orders ----------
function renderOrders(orders) {
    hideSkeleton(ordersList);
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex flex-col gap-1 border border-gray-400";

        const name = document.createElement("p");
        name.textContent = order.name;
        name.className = "text-lg font-semibold text-white";

        const price = document.createElement("p");
        price.textContent = `Total Price: ${order.totalPrice}`;
        price.className = "text-sm text-gray-400";

        const period = document.createElement("p");
        period.textContent = `Usage Period: ${order.usagePeriod}`;
        period.className = "text-sm text-gray-400";

        const status = document.createElement("span");
        status.textContent = order.status;
        status.className = "text-xs font-medium bg-green-500 text-white px-2 py-1 rounded-full w-max";

        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(period);
        card.appendChild(status);

        ordersList.appendChild(card);
    });
}

// ---------- Activities ----------
function renderActivities(activities) {
    hideSkeleton(activitiesList);
    activitiesList.innerHTML = '';
    
    activities.forEach(act => {
        const card = document.createElement("div");
        card.className = "bg-gray-700 rounded-lg p-4 flex flex-col gap-1 border border-gray-400";

        const heading = document.createElement("p");
        heading.textContent = act.heading;
        heading.className = "text-lg font-semibold text-white";

        const subtext = document.createElement("p");
        subtext.textContent = act.subtext;
        subtext.className = "text-sm text-gray-400";

        const date = document.createElement("p");
        date.textContent = act.date;
        date.className = "text-xs text-gray-400";

        card.appendChild(heading);
        card.appendChild(subtext);
        card.appendChild(date);

        activitiesList.appendChild(card);
    });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    loadProjectData(projectId);
});

// Tab functionality
document.addEventListener("DOMContentLoaded", () => {
    const orderSummaryTab = document.getElementById("order-summary-tab");
    const equipmentTab = document.getElementById("equipment-tab");
    const orderSummaryContent = document.getElementById("order-summary-content");
    const equipmentContent = document.getElementById("equipment-content");

    if (orderSummaryTab && equipmentTab && orderSummaryContent && equipmentContent) {
        function showTab(activeTab, activeContent, inactiveTab, inactiveContent) {
            activeTab.classList.add("text-blue-400", "border-blue-400");
            activeTab.classList.remove("text-gray-400");
            inactiveTab.classList.remove("text-blue-400", "border-blue-400");
            inactiveTab.classList.add("text-gray-400");

            activeContent.style.display = "block";
            inactiveContent.style.display = "none";
        }

        orderSummaryTab.addEventListener("click", () => {
            showTab(orderSummaryTab, orderSummaryContent, equipmentTab, equipmentContent);
        });

        equipmentTab.addEventListener("click", () => {
            showTab(equipmentTab, equipmentContent, orderSummaryTab, orderSummaryContent);
        });

        // Initialize with Order Summary tab active
        showTab(orderSummaryTab, orderSummaryContent, equipmentTab, equipmentContent);
    }
});