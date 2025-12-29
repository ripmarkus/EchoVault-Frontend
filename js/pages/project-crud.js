// Project CRUD functionality
const API_BASE = {
    projects: "/api/projects",
    customers: "/api/customers", 
    contacts: "/api/contacts",
    equipment: "/api/equipment",
    users: "/api/users"
};

// State management
let selectedCustomer = null;
let selectedContacts = [];
let selectedEquipment = [];
let selectedProjectManager = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadInitialData();
});

function setupEventListeners() {
    // Modal event listeners
    document.getElementById('select-project-manager-btn').addEventListener('click', openProjectManagerModal);
    document.getElementById('add-contact-btn').addEventListener('click', openContactModal);
    document.getElementById('add-customer-btn').addEventListener('click', openCustomerModal);
    document.getElementById('add-equipment-btn').addEventListener('click', openEquipmentModal);
    
    document.getElementById('close-project-manager-modal').addEventListener('click', closeProjectManagerModal);
    document.getElementById('close-contact-modal').addEventListener('click', closeContactModal);
    document.getElementById('close-customer-modal').addEventListener('click', closeCustomerModal);
    document.getElementById('close-equipment-modal').addEventListener('click', closeEquipmentModal);
    
    // Search functionality
    document.getElementById('project-manager-search').addEventListener('input', debounce(searchProjectManagers, 300));
    document.getElementById('contact-search').addEventListener('input', debounce(searchContacts, 300));
    document.getElementById('customer-search').addEventListener('input', debounce(searchCustomers, 300));
    document.getElementById('equipment-search').addEventListener('input', debounce(searchEquipment, 300));
    
    // Footer buttons
    document.getElementById('cancel-btn').addEventListener('click', cancelCreation);
    document.getElementById('save-btn').addEventListener('click', createProject);
    
    // Close modals when clicking outside
    document.getElementById('project-manager-modal').addEventListener('click', (e) => {
        if (e.target.id === 'project-manager-modal') closeProjectManagerModal();
    });
    document.getElementById('contact-modal').addEventListener('click', (e) => {
        if (e.target.id === 'contact-modal') closeContactModal();
    });
    document.getElementById('customer-modal').addEventListener('click', (e) => {
        if (e.target.id === 'customer-modal') closeCustomerModal();
    });
    document.getElementById('equipment-modal').addEventListener('click', (e) => {
        if (e.target.id === 'equipment-modal') closeEquipmentModal();
    });
}

function loadInitialData() {
    updateProjectManagerDisplay();
    updateContactList();
    updateCustomerDisplay();
    updateEquipmentList();
}

// Project Manager Modal Functions
async function openProjectManagerModal() {
    document.getElementById('project-manager-modal').classList.remove('hidden');
    await searchProjectManagers();
}

function closeProjectManagerModal() {
    document.getElementById('project-manager-modal').classList.add('hidden');
}

async function searchProjectManagers(query = '') {
    try {
        const url = query ? `${API_BASE.users}?q=${encodeURIComponent(query)}` : API_BASE.users;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const users = await response.json();
        renderProjectManagerModalList(users);
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

function renderProjectManagerModalList(users) {
    const container = document.getElementById('project-manager-modal-list');
    container.innerHTML = '';
    
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors';
        userEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    ${user.picture ? 
                        `<img src="${user.picture}" alt="${user.name}" class="w-10 h-10 rounded-full">` :
                        `<div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>`
                    }
                    <div>
                        <h4 class="text-white font-semibold">${user.name || 'Unknown'}</h4>
                        <p class="text-gray-400 text-sm">${user.email || ''}</p>
                    </div>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Select
                </button>
            </div>
        `;
        
        userEl.addEventListener('click', () => selectProjectManager(user));
        container.appendChild(userEl);
    });
}

function selectProjectManager(user) {
    selectedProjectManager = user;
    updateProjectManagerDisplay();
    closeProjectManagerModal();
}

function updateProjectManagerDisplay() {
    const container = document.getElementById('project-manager-display');
    
    if (!selectedProjectManager) {
        container.innerHTML = '<span class="text-gray-400">No project manager selected</span>';
        return;
    }
    
    container.innerHTML = `
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
                ${selectedProjectManager.picture ? 
                    `<img src="${selectedProjectManager.picture}" alt="${selectedProjectManager.name}" class="w-8 h-8 rounded-full">` :
                    `<div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                        ${selectedProjectManager.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>`
                }
                <div>
                    <p class="text-white font-semibold">${selectedProjectManager.name}</p>
                    <p class="text-gray-400 text-sm">${selectedProjectManager.email}</p>
                </div>
            </div>
            <button onclick="removeProjectManager()" 
                class="text-red-400 hover:text-red-300 px-2 py-1">✕</button>
        </div>
    `;
}

function removeProjectManager() {
    selectedProjectManager = null;
    updateProjectManagerDisplay();
}

// Contact Modal Functions
async function openContactModal() {
    document.getElementById('contact-modal').classList.remove('hidden');
    await searchContacts();
}

function closeContactModal() {
    document.getElementById('contact-modal').classList.add('hidden');
}

async function searchContacts(query = '') {
    try {
        const url = query ? `${API_BASE.contacts}?q=${encodeURIComponent(query)}` : API_BASE.contacts;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        
        const contacts = await response.json();
        renderContactModalList(contacts);
    } catch (error) {
        console.error('Error searching contacts:', error);
    }
}

function renderContactModalList(contacts) {
    const container = document.getElementById('contact-modal-list');
    container.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactEl = document.createElement('div');
        contactEl.className = 'bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors';
        contactEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="text-white font-semibold">${contact.name || 'Unknown'}</h4>
                    <p class="text-gray-400 text-sm">${contact.email || ''}</p>
                    <p class="text-gray-400 text-sm">${contact.phone || ''}</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Select
                </button>
            </div>
        `;
        
        contactEl.addEventListener('click', () => selectContact(contact));
        container.appendChild(contactEl);
    });
}

function selectContact(contact) {
    if (!selectedContacts.find(c => c.id === contact.id)) {
        selectedContacts.push(contact);
        updateContactList();
    }
    closeContactModal();
}

function updateContactList() {
    const container = document.getElementById('contact-list');
    container.innerHTML = '';
    
    if (selectedContacts.length === 0) {
        container.innerHTML = '<p class="text-gray-400">No contacts added</p>';
        return;
    }
    
    selectedContacts.forEach((contact, index) => {
        const contactEl = document.createElement('div');
        contactEl.className = 'bg-gray-700 rounded-lg p-4 flex justify-between items-center border border-gray-400';
        contactEl.innerHTML = `
            <div>
                <h4 class="text-blue-400 font-semibold">${contact.name || 'Unknown'}</h4>
                <p class="text-gray-400 text-sm">${contact.email || ''}</p>
                <p class="text-gray-400 text-sm">${contact.phone || ''}</p>
            </div>
            <button onclick="removeContact(${index})" 
                class="text-red-400 hover:text-red-300 px-2 py-1">✕</button>
        `;
        container.appendChild(contactEl);
    });
}

function removeContact(index) {
    selectedContacts.splice(index, 1);
    updateContactList();
}

// Customer Modal Functions
async function openCustomerModal() {
    document.getElementById('customer-modal').classList.remove('hidden');
    await searchCustomers();
}

function closeCustomerModal() {
    document.getElementById('customer-modal').classList.add('hidden');
}

async function searchCustomers(query = '') {
    try {
        const url = query ? `${API_BASE.customers}?q=${encodeURIComponent(query)}` : API_BASE.customers;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch customers');
        
        const customers = await response.json();
        renderCustomerModalList(customers);
    } catch (error) {
        console.error('Error searching customers:', error);
    }
}

function renderCustomerModalList(customers) {
    const container = document.getElementById('customer-modal-list');
    container.innerHTML = '';
    
    customers.forEach(customer => {
        const customerEl = document.createElement('div');
        customerEl.className = 'bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors';
        customerEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="text-white font-semibold">${customer.name}</h4>
                    <p class="text-gray-400 text-sm">CVR: ${customer.cvr || 'N/A'}</p>
                    <p class="text-gray-400 text-sm">${customer.address || ''}</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Select
                </button>
            </div>
        `;
        
        customerEl.addEventListener('click', () => selectCustomer(customer));
        container.appendChild(customerEl);
    });
}

function selectCustomer(customer) {
    selectedCustomer = customer;
    updateCustomerDisplay();
    closeCustomerModal();
}

function updateCustomerDisplay() {
    const container = document.getElementById('customer-container');
    
    if (!selectedCustomer) {
        container.innerHTML = '<p class="text-gray-400">No customer selected</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="bg-gray-700 rounded-lg p-4 flex justify-between items-center border border-gray-400">
            <div>
                <h4 class="text-blue-400 font-semibold">${selectedCustomer.name}</h4>
                <p class="text-gray-400 text-sm">CVR: ${selectedCustomer.cvr || 'N/A'}</p>
                <p class="text-gray-400 text-sm">${selectedCustomer.address || ''}</p>
            </div>
            <button onclick="removeCustomer()" 
                class="text-red-400 hover:text-red-300 px-2 py-1">✕</button>
        </div>
    `;
}

function removeCustomer() {
    selectedCustomer = null;
    updateCustomerDisplay();
}

// Equipment Modal Functions
async function openEquipmentModal() {
    document.getElementById('equipment-modal').classList.remove('hidden');
    await searchEquipment();
}

function closeEquipmentModal() {
    document.getElementById('equipment-modal').classList.add('hidden');
}

async function searchEquipment(query = '') {
    try {
        let equipmentList = [];
        
        if (query) {
            // Simple filter on cached equipment for search
            const response = await fetch(API_BASE.equipment);
            if (!response.ok) throw new Error('Failed to fetch equipment');
            const allEquipment = await response.json();
            equipmentList = allEquipment.filter(eq => 
                eq.name?.toLowerCase().includes(query.toLowerCase()) ||
                eq.model?.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            const response = await fetch(API_BASE.equipment);
            if (!response.ok) throw new Error('Failed to fetch equipment');
            equipmentList = await response.json();
        }
        
        renderEquipmentModalList(equipmentList);
    } catch (error) {
        console.error('Error searching equipment:', error);
    }
}

function renderEquipmentModalList(equipment) {
    const container = document.getElementById('equipment-modal-list');
    container.innerHTML = '';
    
    equipment.forEach(item => {
        const equipmentEl = document.createElement('div');
        equipmentEl.className = 'bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors';
        equipmentEl.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="text-white font-semibold">${item.name}</h4>
                    <p class="text-gray-400 text-sm">Model: ${item.model || 'N/A'}</p>
                    <p class="text-gray-400 text-sm">Type: ${item.type || 'N/A'}</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Select
                </button>
            </div>
        `;
        
        equipmentEl.addEventListener('click', () => selectEquipment(item));
        container.appendChild(equipmentEl);
    });
}

function selectEquipment(equipment) {
    if (!selectedEquipment.find(e => e.id === equipment.id)) {
        selectedEquipment.push(equipment);
        updateEquipmentList();
    }
    closeEquipmentModal();
}

function updateEquipmentList() {
    const container = document.getElementById('equipment-list');
    container.innerHTML = '';
    
    if (selectedEquipment.length === 0) {
        container.innerHTML = '<p class="text-gray-400">No equipment added</p>';
        return;
    }
    
    selectedEquipment.forEach((equipment, index) => {
        const equipmentEl = document.createElement('div');
        equipmentEl.className = 'bg-gray-700 rounded-lg p-4 flex justify-between items-center border border-gray-400';
        equipmentEl.innerHTML = `
            <div>
                <h4 class="text-blue-400 font-semibold">${equipment.name}</h4>
                <p class="text-gray-400 text-sm">Model: ${equipment.model || 'N/A'}</p>
                <p class="text-gray-400 text-sm">Type: ${equipment.type || 'N/A'}</p>
            </div>
            <button onclick="removeEquipment(${index})" 
                class="text-red-400 hover:text-red-300 px-2 py-1">✕</button>
        `;
        container.appendChild(equipmentEl);
    });
}

function removeEquipment(index) {
    selectedEquipment.splice(index, 1);
    updateEquipmentList();
}

// Project Creation Functions
async function createProject() {
    try {
        // Validate required fields
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }
        
        const formData = new FormData(document.getElementById('project-form'));
        const rentalStart = formData.get('rentalStart');
        const rentalEnd = formData.get('rentalEnd');
        
        if (!rentalStart || !rentalEnd) {
            alert('Please select rental start and end dates');
            return;
        }
        
        // Prepare project data
        const projectData = {
            customerId: selectedCustomer.id, // Send as string ID
            projectManagerId: selectedProjectManager ? selectedProjectManager.id : null,
            startDate: rentalStart,
            endDate: rentalEnd,
            usageStartDate: formData.get('usageStart') || null,
            usageEndDate: formData.get('usageEnd') || null,
            status: 'REQUESTED'
        };
        
        // Create project
        const response = await fetch(API_BASE.projects, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        
        // Show success message and redirect
        alert('Project created successfully!');
        window.location.href = 'project-list.html';
        
    } catch (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project. Please try again.');
    }
}

function cancelCreation() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        window.location.href = 'project-list.html';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions available globally for onclick handlers
window.removeProjectManager = removeProjectManager;
window.removeContact = removeContact;
window.removeCustomer = removeCustomer;
window.removeEquipment = removeEquipment;