//navbar.js
const navbarHTML = `
<nav class="bg-[#121212]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16 justify-between">
            <!-- Left side: Logo + Links -->
            <div class="flex items-center space-x-8">
                <h1 class="text-3xl font-bold text-white">EchoVault</h1>
                <nav class="hidden md:flex items-center space-x-4">
                    <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors">Home</a>
                    <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors">Inventory</a>
                    <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors">Data</a>
                    <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors">All Projects</a>
                    <a href="#" class="text-gray-300 hover:text-blue-400 transition-colors">Customers</a>
                </nav>
            </div>
            <div class="flex items-center space-x-8">
                <a href="#" class="text-blue-400 hover:font-bold transition-all">Calendar</a>
                <a href="/create-new-project.html" id="add-project-btn"
                        class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200">
                    New Project
                </a>
            </div>
        </div>
    </div>
</nav>
`;

export function loadNavbar(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = navbarHTML;
  }
}
