export function createSkeleton(rows = 3, widths = ['3/4', '5/6', '2/3']) {
    // defaults to 3 rows with varying widths
    const container = document.createElement('div');
    container.className = 'animate-pulse space-y-2';

    for (let i = 0; i < rows; i++) {
        const row = document.createElement('div');
        row.className = `h-4 bg-gray-700 rounded w-${widths[i % widths.length]}`;
        container.appendChild(row);
    }

    return container;
}

export function showSkeleton(container, rows = 3, widths) {
    container.innerHTML = ''; // clear existing content
    const skeleton = createSkeleton(rows, widths);
    container.appendChild(skeleton);
}

export function hideSkeleton(container) {
    container.innerHTML = ''; // remove skeleton
}

export function simulateLoading(callback, delay = 1500) {
    setTimeout(callback, delay);
}