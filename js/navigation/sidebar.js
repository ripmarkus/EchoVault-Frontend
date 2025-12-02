// sidebar.js
const sidebarHTML = `
<div class="flex max-h-screen bg-[#121212] p-8">
    <!-- Sidebar Container -->
    <aside class="w-64 bg-gray-800 text-white rounded-2xl shadow-xl flex flex-col p-6 space-y-6
                 min-h-[900px] max-h-[90vh] overflow-y-auto">

        <nav class="flex flex-col space-y-4">
            <a href="#" class="text-gray-300">Home</a>
            <a href="#" class="text-gray-300">Inventory</a>
            <a href="#" class="text-gray-300">Data</a>
            <a href="#" class="text-gray-300">All Projects</a>
            <a href="#" class="text-gray-300">Customers</a>
        </nav>
        <div class="flex-grow"></div>
        <a href="#" class="text-red-400 hover:text-red-300 font-semibold transition-all">
            Logout
        </a>

    </aside>
</div>
`;

export function loadSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = sidebarHTML;
    }
}
