const sidebarHTML = `
<div class="flex max-h-page bg-[#181818] p-2">
  <aside class="w-[240px] text-white rounded-2xl flex flex-col p-4 space-y-6 min-h-[1300px] max-h-[90vh] overflow-y-hidden">

    <!-- Top: EchoVault + New Project -->
    <div class="flex flex-col space-y-4">
    <h1 class="text-[2.8rem] font-bold text-white">EchoVault</h1>
      <a href="../../html/create-new-project.html" id="add-project-btn"
         class="px-6 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200 text-center">
        New Project
      </a>
    </div>

    <!-- Main Navigation -->
    <nav class="flex flex-col space-y-4">

      <!-- Home -->
      <a href="../../html/home.html" class="flex items-center gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"></path>
        </svg>
        Home
      </a>

      <!-- My Projects -->
      <a href="#" class="flex items-center gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        My Projects
      </a>

      <hr class="border-t border-gray-300 my-4">

      <!-- Inventory (Collapsible) -->
      <div>
        <button id="inventory-btn" class="flex items-center justify-between w-full gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
          <div class="flex items-center gap-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            Inventory
          </div>
          <svg id="inventory-arrow" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div id="inventory-menu" class="flex flex-col ml-14 mt-2 space-y-2 hidden text-gray-300 text-lg">
          <a href="../../html/inventory.html" class="hover:text-blue-400">All Equipment</a>
          <a href="#" class="hover:text-blue-400">Warehouse</a>
          <a href="#" class="hover:text-blue-400">Shortages</a>
          <a href="#" class="hover:text-blue-400">In Repair</a>
        </div>
      </div>

      <!-- Calendar -->
      <a href="#" class="flex items-center gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        Calendar
      </a>

      <!-- All Projects -->
      <a href="../../html/project-list.html" class="flex items-center gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        All Projects
      </a>

      <!-- Customers (Collapsible) -->
      <div>
        <button id="customers-btn" class="flex items-center justify-between w-full gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
          <div class="flex items-center gap-6">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Customers
          </div>
          <svg id="customers-arrow" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div id="customers-menu" class="flex flex-col ml-14 mt-2 space-y-2 hidden text-gray-300 text-lg">
          <a href="../../html/customers.html" class="hover:text-blue-400">All Customers</a>
          <a href="#" class="hover:text-blue-400">All Contacts</a>
        </div>
      </div>

      <hr class="border-t border-gray-300 my-4">

      <!-- Data -->
      <a href="#" class="flex items-center gap-6 text-gray-300 hover:text-blue-400 transition-colors text-xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        Data
      </a>

    </nav>

    <div class="flex-grow max-h-[400px]"></div>

    <!-- Bottom Links: Help + Logout -->
    <a href="#" class="flex items-center gap-6 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors text-xl mb-2">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M12 14v-4m0 0a4 4 0 11-4 4h4z"></path>
      </svg>
      Help Center
    </a>
    <a href="#" class="flex items-center gap-6 text-red-400 hover:text-red-300 font-semibold transition-colors text-xl">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
      Logout
    </a>

  </aside>
</div>
`;

export function loadSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = sidebarHTML;

  // Collapse functionality after DOM insertion
  const inventoryBtn = container.querySelector('#inventory-btn');
  const customersBtn = container.querySelector('#customers-btn');

  const inventoryMenu = container.querySelector('#inventory-menu');
  const inventoryArrow = container.querySelector('#inventory-arrow');

  const customersMenu = container.querySelector('#customers-menu');
  const customersArrow = container.querySelector('#customers-arrow');

  inventoryBtn.addEventListener('click', () => {
    inventoryMenu.classList.toggle('hidden');
    inventoryArrow.classList.toggle('rotate-180');
  });

  customersBtn.addEventListener('click', () => {
    customersMenu.classList.toggle('hidden');
    customersArrow.classList.toggle('rotate-180');
  });
}
