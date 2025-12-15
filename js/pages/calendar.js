const PROJECTS_API = "http://localhost:8080/api/projects";

let currentView = "month";          // "month" | "week"
let currentDate = new Date();       // reference date for current view
let allProjects = [];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const displayName = p => (p.name && p.name.trim()) ? p.name : "Unnamed project";
const parseDate = str => new Date(`${str}T00:00:00`);
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const formatMonthYear = d => d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const formatShortDate = d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
const mondayIndex = d => (d.getDay() + 6) % 7;
const startOfWeek = d => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -mondayIndex(d));

const inRange = (date, start, end) => date >= start && date <= end;
const toDateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

async function loadProjects(q = "") {
    try {
        const url = q ? `${PROJECTS_API}?q=${encodeURIComponent(q)}` : PROJECTS_API;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();
        allProjects = data.map(p => ({
            ...p,
            startDate: parseDate(p.startDate),
            endDate: parseDate(p.endDate),
        }));

        updateCalendar();
    } catch (err) {
        console.error("Error loading projects:", err);
        allProjects = [];
        updateCalendar();
    }
}

function getFilteredProjects() {
    const selected = (document.getElementById("calendar-status-filter")?.value ?? "ALL").toUpperCase();
    return selected === "ALL" ? allProjects : allProjects.filter(p => p.status === selected);
}

function updateCalendar() {
    const projects = getFilteredProjects();
    const rangeLabel = document.getElementById("calendar-current-range");

    if (currentView === "month") {
        rangeLabel.textContent = formatMonthYear(currentDate);
        renderMonthView(projects);
    } else {
        const ws = startOfWeek(currentDate);
        const we = addDays(ws, 6);
        rangeLabel.textContent = `${formatShortDate(ws)} – ${formatShortDate(we)}`;
        renderWeekView(ws, projects);
    }
}

function renderMonthView(projects) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    const ms = startOfMonth(currentDate);
    const firstGridDay = startOfWeek(ms);

    for (let w = 0; w < 6; w++) {
        const weekStart = addDays(firstGridDay, w * 7);

        const weekEl = document.createElement("div");
        weekEl.className = "mb-3";

        const daysRow = document.createElement("div");
        daysRow.className = "grid grid-cols-7 gap-2";

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            daysRow.appendChild(createDayCell(day, ms, projects, true));
        }

        const eventsRow = document.createElement("div");
        eventsRow.className = "grid grid-cols-7 gap-2 mt-1";
        eventsRow.dataset.weekKey = toDateKey(weekStart);

        weekEl.appendChild(daysRow);
        weekEl.appendChild(eventsRow);
        grid.appendChild(weekEl);

        renderWeekBars(eventsRow, projects);
    }
}

function renderWeekView(weekStart, projects) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        grid.appendChild(createDayCell(day, weekStart, projects, false));
    }
}

// --- lane-packed bars (top if no overlap) ---
function renderWeekBars(container, projects) {
    const weekStart = parseDate(container.dataset.weekKey);
    const weekEnd = addDays(weekStart, 6);

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
    container.style.gridAutoRows = "22px";
    container.style.alignItems = "start";

    const weekProjects = projects
        .filter(p => !(p.endDate < weekStart || p.startDate > weekEnd))
        .slice()
        .sort((a, b) => (a.startDate - b.startDate) || displayName(a).localeCompare(displayName(b)));

    const lanes = []; // lanes[i] = last end date in lane i

    weekProjects.forEach(p => {
        let start = p.startDate < weekStart ? weekStart : p.startDate;
        let end = p.endDate > weekEnd ? weekEnd : p.endDate;
        if (end < start) [start, end] = [end, start];

        const startIdx = mondayIndex(start);
        const endIdx = mondayIndex(end);
        const span = endIdx - startIdx + 1;

        let laneIndex = lanes.findIndex(lastEnd => lastEnd < start);
        if (laneIndex === -1) {
            lanes.push(end);
            laneIndex = lanes.length - 1;
        } else {
            lanes[laneIndex] = end;
        }

        const bar = document.createElement("div");
        bar.style.gridColumnStart = String(startIdx + 1);
        bar.style.gridColumnEnd = `span ${span}`;
        bar.style.gridRowStart = String(laneIndex + 1);

        bar.className = "px-2 py-1 text-[10px] rounded truncate cursor-pointer select-none";
        bar.classList.add(...statusClasses(p.status));
        bar.textContent = displayName(p);

        container.appendChild(bar);
    });
}

function createDayCell(day, referenceDate, projects, monthMode) {
    const cell = document.createElement("div");
    cell.className = "relative min-h-[90px] md:min-h-[120px] p-2 bg-gray-900";

    if (monthMode && day.getMonth() !== referenceDate.getMonth()) {
        cell.classList.add("bg-gray-900/60", "text-gray-500");
    }

    if (day.getTime() === TODAY.getTime()) {
        cell.classList.add("ring-2", "ring-blue-500");
    }

    const header = document.createElement("div");
    header.className = "flex justify-between items-center mb-1";
    header.innerHTML = `<span class="text-xs md:text-sm font-semibold">${day.getDate()}</span>`;
    cell.appendChild(header);

    if (monthMode) {
        const count = projects.filter(p => inRange(day, p.startDate, p.endDate)).length;
        if (count) {
            const dot = document.createElement("div");
            dot.className = "mt-2 text-[10px] text-gray-300";
            dot.textContent = `${count} project${count > 1 ? "s" : ""}`;
            cell.appendChild(dot);
        }
        return cell;
    }

    const eventsForDay = projects.filter(p => inRange(day, p.startDate, p.endDate));
    const maxVisible = 3;

    const eventsContainer = document.createElement("div");
    eventsContainer.className = "space-y-1";

    eventsForDay.slice(0, maxVisible).forEach(p => {
        const badge = document.createElement("div");
        badge.className = "text-[10px] md:text-xs px-2 py-1 rounded truncate cursor-pointer";
        badge.classList.add(...statusClasses(p.status));
        badge.textContent = `${displayName(p)}${p.customerName ? ` • ${p.customerName}` : ""}`;
        eventsContainer.appendChild(badge);
    });

    if (eventsForDay.length > maxVisible) {
        const more = document.createElement("div");
        more.className = "text-[10px] md:text-xs text-gray-300";
        more.textContent = `+${eventsForDay.length - maxVisible} more`;
        eventsContainer.appendChild(more);
    }

    cell.appendChild(eventsContainer);
    return cell;
}

function statusClasses(status) {
    switch (status) {
        case "CONFIRMED": return ["bg-blue-600", "hover:bg-blue-500", "text-white"];
        case "CANCELLED": return ["bg-red-600", "hover:bg-red-500", "text-white"];
        default:          return ["bg-yellow-500", "hover:bg-yellow-400", "text-black"];
    }
}

// ---------- UI wiring ----------
function setupViewSwitch() {
    const monthBtn = document.getElementById("view-month-btn");
    const weekBtn = document.getElementById("view-week-btn");
    if (!monthBtn || !weekBtn) return;

    monthBtn.addEventListener("click", () => {
        currentView = "month";
        monthBtn.className = "px-4 py-2 text-sm bg-gray-800 text-gray-200 hover:bg-gray-700";
        weekBtn.className  = "px-4 py-2 text-sm bg-gray-900 text-gray-400 hover:bg-gray-700";
        updateCalendar();
    });

    weekBtn.addEventListener("click", () => {
        currentView = "week";
        weekBtn.className  = "px-4 py-2 text-sm bg-gray-800 text-gray-200 hover:bg-gray-700";
        monthBtn.className = "px-4 py-2 text-sm bg-gray-900 text-gray-400 hover:bg-gray-700";
        updateCalendar();
    });
}

function setupNavigation() {
    document.getElementById("calendar-prev-btn")?.addEventListener("click", () => {
        currentDate = currentView === "month"
            ? new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
            : addDays(currentDate, -7);
        updateCalendar();
    });

    document.getElementById("calendar-next-btn")?.addEventListener("click", () => {
        currentDate = currentView === "month"
            ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
            : addDays(currentDate, 7);
        updateCalendar();
    });

    document.getElementById("calendar-today-btn")?.addEventListener("click", () => {
        currentDate = new Date();
        updateCalendar();
    });
}

function setupSearchAndFilters() {
    const searchBtn = document.getElementById("calendar-search-btn");
    const searchInput = document.getElementById("calendar-search-input");
    const statusSelect = document.getElementById("calendar-status-filter");

    searchBtn?.addEventListener("click", () => loadProjects((searchInput?.value || "").trim()));
    searchInput?.addEventListener("keypress", e => e.key === "Enter" && loadProjects((searchInput?.value || "").trim()));
    statusSelect?.addEventListener("change", updateCalendar);
}

document.addEventListener("DOMContentLoaded", () => {
    setupViewSwitch();
    setupNavigation();
    setupSearchAndFilters();
    loadProjects();
});
