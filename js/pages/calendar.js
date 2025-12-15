const PROJECTS_API = "http://localhost:8080/api/projects";

let currentView = "month";     // "month" | "week"
let currentDate = new Date();   // reference date for current view
let allProjects = [];

const TODAY = new Date();
TODAY.setHours(0,0,0,0);

function displayName(p) {
    return (p.name && p.name.trim()) ? p.name : "Unnamed project";
}

// ---------- helpers ----------
function parseDate(str) {
    // LocalDate -> "YYYY-MM-DD"
    return new Date(str + "T00:00:00");
}

function formatMonthYear(date) {
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatShortDate(date) {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Monday = 0 ... Sunday = 6
function mondayIndex(date) {
    return (date.getDay() + 6) % 7;
}

function startOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - mondayIndex(d));
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isDateInRange(date, start, end) {
    return date >= start && date <= end;
}

// ---------- backend load (matches ProjectController: ?q= ) ----------
async function loadProjects(q = "") {
    try {
        const url = q
            ? `${PROJECTS_API}?q=${encodeURIComponent(q)}`
            : PROJECTS_API;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();

        // Map 1:1 to your ProjectResponse record
        allProjects = data.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,              // "REQUESTED" | "CONFIRMED" | "CANCELLED"
            startDate: parseDate(p.startDate),
            endDate: parseDate(p.endDate),
            shortages: p.shortages,
            customerId: p.customerId,
            customerName: p.customerName
        }));

        updateCalendar();
    } catch (err) {
        console.error("Error loading projects:", err);
        allProjects = [];
        updateCalendar();
    }
}

// ---------- filtering (status filter is frontend-only) ----------
function getFilteredProjects() {
    const statusSelect = document.getElementById("calendar-status-filter");
    const raw = statusSelect?.value ?? "ALL";

    const selected = raw.toUpperCase();

    return allProjects.filter(p =>
        selected === "ALL" || p.status === selected);
}

// ---------- render main ----------
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
    const firstGridDay = startOfWeek(ms); // Monday
    const weeks = 6;

    for (let w = 0; w < weeks; w++) {
        const weekStart = addDays(firstGridDay, w * 7);

        // wrapper for this week
        const weekEl = document.createElement("div");
        weekEl.className = "mb-3";

        // days row (7 cols)
        const daysRow = document.createElement("div");
        daysRow.className = "grid grid-cols-7 gap-2";

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            daysRow.appendChild(createDayCell(day, ms, projects, { monthMode: true }));
        }

        // events row (7 cols) - bars go here
        const eventsRow = document.createElement("div");
        eventsRow.className = "grid grid-cols-7 gap-2 mt-1";
        eventsRow.dataset.weekKey = toDateKey(weekStart);

        weekEl.appendChild(daysRow);
        weekEl.appendChild(eventsRow);
        grid.appendChild(weekEl);

        // render week bars AFTER days are placed
        renderWeekBars(eventsRow, projects);
    }
}

// ---------- week view ----------
function renderWeekView(weekStart, projects) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        grid.appendChild(createDayCell(day, weekStart, projects, { monthMode: false }));
    }
}

function toDateKey(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function renderWeekBars(container, projects) {
    // weekStart is stored as local YYYY-MM-DD (not ISO/UTC)
    const weekStart = parseDate(container.dataset.weekKey);
    const weekEnd = addDays(weekStart, 6);

    // clear previous bars (if rerender)
    container.innerHTML = "";

    // filter projects that overlap with this week
    const weekProjects = projects.filter(p => !(p.endDate < weekStart || p.startDate > weekEnd));

    if (weekProjects.length === 0) {
        return; // nothing to render
    }

    const STATUS_ORDER = {
        "CONFIRMED": 1,
        "REQUESTED": 2,
        "CANCELLED": 3
    };

    const ordered = (weekProjects.length === 1)
        ? weekProjects
        : weekProjects.slice().sort((a, b) => {
            const sa = STATUS_ORDER[a.status] ?? 99;
            const sb = STATUS_ORDER[b.status] ?? 99;
            if (sa !== sb) return sa - sb;
            return a.startDate - b.startDate;
        });

    // 3) Setup grid 7 cols x N rows
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(7, minmax(0, 1fr))";
    container.style.gridAutoRows = "22px"; // højde pr række (justér)
    container.style.alignItems = "start";

    // 4) Place bars
    ordered.forEach((p, index) => {
        const start = p.startDate < weekStart ? weekStart : p.startDate;
        const end = p.endDate > weekEnd ? weekEnd : p.endDate;

        const startIdx = mondayIndex(start);          // 0..6
        const span = mondayIndex(end) - startIdx + 1; // 1..7

        const bar = document.createElement("div");

        bar.style.gridColumnStart = String(startIdx + 1);
        bar.style.gridColumnEnd = `span ${span}`;
        bar.style.gridRowStart = String(index + 1); // ✅ +1 because CSS grid rows are 1-based

        bar.className = "px-2 py-1 text-[10px] rounded truncate cursor-pointer select-none";
        bar.classList.add(...statusClasses(p.status));

        const title = displayName(p);
        bar.textContent = title;

        container.appendChild(bar);
    });
}

// ---------- day cell ----------
function createDayCell(day, referenceDate, projects, { monthMode }) {
    const cell = document.createElement("div");
    cell.className = "relative min-h-[90px] md:min-h-[120px] p-2 bg-gray-900";

    // outside current month (only month view)
    if (monthMode && day.getMonth() !== referenceDate.getMonth()) {
        cell.classList.add("bg-gray-900/60", "text-gray-500");
    }

    // today highlight
    const today = new Date();
    if (isSameDay(day, TODAY)) {
        cell.classList.add("ring-2", "ring-blue-500");
    }

    // header day number
    const header = document.createElement("div");
    header.className = "flex justify-between items-center mb-1";
    header.innerHTML = `<span class="text-xs md:text-sm font-semibold">${day.getDate()}</span>`;
    cell.appendChild(header);

    // MONTH VIEW: show count only (bars are rendered elsewhere)
    if (monthMode) {
        const count = projects.filter(p => isDateInRange(day, p.startDate, p.endDate)).length;
        if (count > 0) {
            const dot = document.createElement("div");
            dot.className = "mt-2 text-[10px] text-gray-300";
            dot.textContent = `${count} project${count > 1 ? "s" : ""}`;
            cell.appendChild(dot);
        }
        return cell;
    }

    // WEEK VIEW: render badges in day cell
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "space-y-1";

    const eventsForDay = projects.filter(p => isDateInRange(day, p.startDate, p.endDate));
    const maxVisible = 3;

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
        case "CONFIRMED":
            return ["bg-blue-600", "hover:bg-blue-500", "text-white"];
        case "CANCELLED":
            return ["bg-red-600", "hover:bg-red-500", "text-white"];
        case "REQUESTED":
        default:
            return ["bg-yellow-500", "hover:bg-yellow-400", "text-black"];
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
        weekBtn.className = "px-4 py-2 text-sm bg-gray-900 text-gray-400 hover:bg-gray-700";
        updateCalendar();
    });

    weekBtn.addEventListener("click", () => {
        currentView = "week";
        weekBtn.className = "px-4 py-2 text-sm bg-gray-800 text-gray-200 hover:bg-gray-700";
        monthBtn.className = "px-4 py-2 text-sm bg-gray-900 text-gray-400 hover:bg-gray-700";
        updateCalendar();
    });
}

function setupNavigation() {
    const prevBtn = document.getElementById("calendar-prev-btn");
    const nextBtn = document.getElementById("calendar-next-btn");
    const todayBtn = document.getElementById("calendar-today-btn");

    prevBtn?.addEventListener("click", () => {
        if (currentView === "month") {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        } else {
            currentDate = addDays(currentDate, -7);
        }
        updateCalendar();
    });

    nextBtn?.addEventListener("click", () => {
        if (currentView === "month") {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else {
            currentDate = addDays(currentDate, 7);
        }
        updateCalendar();
    });

    todayBtn?.addEventListener("click", () => {
        currentDate = new Date();
        updateCalendar();
    });
}

function setupSearchAndFilters() {
    const searchBtn = document.getElementById("calendar-search-btn");
    const searchInput = document.getElementById("calendar-search-input");
    const statusSelect = document.getElementById("calendar-status-filter");

    // Search uses backend ?q=
    searchBtn?.addEventListener("click", () => {
        const q = (searchInput?.value || "").trim();
        loadProjects(q);
    });

    searchInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const q = (searchInput?.value || "").trim();
            loadProjects(q);
        }
    });

    // Status filter is client-side on currently loaded list
    statusSelect?.addEventListener("change", () => {
        updateCalendar();
    });
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
    setupViewSwitch();
    setupNavigation();
    setupSearchAndFilters();
    loadProjects(); // initial load
});