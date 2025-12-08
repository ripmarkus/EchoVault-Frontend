import { showSkeleton, hideSkeleton, simulateLoading } from '../util/skeleton.js';

// Example data
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

const projectInfo = {
    projectName: "Dj Aligator Store Vega",
    projectTotal: "22937,4 kr",
    projectManager: "Hjalte Larsen",
    confirmationDate: "2025-12-10",
    type: "Rental",
    phase: "Planning",
};

const customersList = document.getElementById("customers-list");
const contactList = document.getElementById("contact-list");
const ordersList = document.getElementById("orders-list");
const activitiesList = document.getElementById("activities-list");
const equipmentList = document.getElementById("equipment-list");

// Tab elements
const orderSummaryTab = document.getElementById("order-summary-tab");
const equipmentTab = document.getElementById("equipment-tab");
const orderSummaryContent = document.getElementById("order-summary-content");
const equipmentContent = document.getElementById("equipment-content");
const rightColumn = document.getElementById("right-column");
const mainGrid = document.getElementById("main-grid");

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

// Show skeleton loaders initially
[customersList, contactList, ordersList, activitiesList].forEach(container => showSkeleton(container, 3));

// Helper function to pick tag color based on role
function getTagColor(role) {
    role = role.toLowerCase();
    if (role === "artist") return "bg-green-500";
    if (role === "agency" || role === "agent" || role === "booking") return "bg-purple-500";
    return "bg-gray-500";
}

// ---------- Customers ----------
hideSkeleton(customersList);
customers.forEach(customer => {
    const card = document.createElement("div");
    card.className = "bg-gray-700 rounded-lg p-4 flex items-center gap-4 border border-gray-400";

    const photoContainer = document.createElement("div");
    photoContainer.className = "w-[82px] h-[82px] rounded-full overflow-hidden flex-shrink-0";
    const img = document.createElement("img");
    img.src = customer.photo;
    img.alt = customer.name;
    img.className = "w-full h-full object-cover scale-125";
    photoContainer.appendChild(img);

    const info = document.createElement("div");
    info.className = "flex flex-col space-y-1";
    const name = document.createElement("a");
    name.textContent = customer.name;
    name.href = "#";
    name.className = "text-2xl text-blue-400 font-semibold hover:underline";
    const tag = document.createElement("span");
    tag.textContent = customer.role;
    tag.className = `text-xs font-medium ${getTagColor(customer.role)} text-white px-2 py-1 rounded-full w-max`;
    info.appendChild(name);
    info.appendChild(tag);

    card.appendChild(photoContainer);
    card.appendChild(info);
    customersList.appendChild(card);
});

// ---------- Contacts ----------
hideSkeleton(contactList);
contacts.forEach(contact => {
    const card = document.createElement("div");
    card.className = "bg-gray-700 rounded-lg p-4 flex items-start gap-4 border border-gray-400";

    const info = document.createElement("div");
    info.className = "flex flex-col space-y-2";

    const nameTagRow = document.createElement("div");
    nameTagRow.className = "flex items-center gap-4"; // horizontal row

    const name = document.createElement("a");
    name.textContent = contact.name;
    name.href = "#";
    name.className = "text-2xl text-blue-400 font-semibold hover:underline";

    const tag = document.createElement("span");
    tag.textContent = contact.role;
    tag.className = `text-xs font-medium ${getTagColor(contact.role)} text-white px-2 py-1 rounded-full w-max mt-1`;

    nameTagRow.appendChild(name);
    nameTagRow.appendChild(tag);

    const email = document.createElement("a");
    email.textContent = contact.email;
    email.href = `mailto:${contact.email}`;
    email.className = "text-sm text-gray-400 font-semibold";

    const phone = document.createElement("p");
    phone.textContent = contact.phone;
    phone.className = "text-sm text-gray-400 font-semibold";

    info.appendChild(nameTagRow);
    info.appendChild(email);
    info.appendChild(phone);

    card.appendChild(info);

    contactList.appendChild(card);
});

// ---------- Orders ----------
hideSkeleton(ordersList);
orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "bg-gray-700 rounded-lg p-4 flex flex-col gap-2 border border-gray-400";

    const name = document.createElement("p");
    name.textContent = `Name: ${order.name}`;
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

// ---------- Activities ----------
hideSkeleton(activitiesList);
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

// ---------- About This Project ----------

const projectManager = document.getElementById("project-manager");
const projectType = document.getElementById("project-type");
const projectPhase = document.getElementById("project-phase");
const projectTitle = document.getElementById("project-title");
const projectTotal = document.getElementById("project-total");
const projectConfirmationDate = document.getElementById("project-confirmation-date");

// Show skeleton loaders for project info sections
[projectManager, projectType, projectPhase, projectTitle, projectTotal, projectConfirmationDate]
    .filter(element => element) // Only process elements that exist
    .forEach(element => showSkeleton(element, 1));

// Hide skeleton loaders and populate project info
[projectManager, projectType, projectPhase, projectTitle, projectTotal, projectConfirmationDate]
    .filter(element => element)
    .forEach(element => hideSkeleton(element));

projectManager.textContent = `${projectInfo.projectManager}`;
projectType.textContent = `${projectInfo.type}`;
projectPhase.textContent = `${projectInfo.phase}`;
projectTitle.textContent = `${projectInfo.projectName}`;
projectTotal.textContent = `${projectInfo.projectTotal}`;
projectConfirmationDate.textContent = `${projectInfo.confirmationDate}`;