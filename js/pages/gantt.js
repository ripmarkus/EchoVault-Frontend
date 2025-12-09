// gantt.js - Gantt Chart functionality for project timeline visualization

// Update Gantt chart with project data
export function updateGanttChart(projectData, formatDateToEU) {
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
    } else {
        const rentalBar = document.getElementById("rental-period-bar");
        if (rentalBar) rentalBar.style.display = "none";
    }
    
    // Update usage period
    if (usageStart && usageEnd) {
        const usagePosition = calculateBarPosition(usageStart, usageEnd, timelineRange);
        updatePeriodBar('usage-period-bar', usagePosition);
    } else {
        const usageBar = document.getElementById("usage-period-bar");
        if (usageBar) usageBar.style.display = "none";
    }
}

// Enhanced example timeline update
export function updateExampleGanttChart(formatDateToEU) {
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
        div.className = 'text-center text-xs';
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