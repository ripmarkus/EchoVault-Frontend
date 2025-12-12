// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Button interactions - only if elements exist
    const primaryBtn = document.getElementById('primary-btn');
    const secondaryBtn = document.getElementById('secondary-btn');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
            showNotification('Getting started with EchoVault!', 'success');
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', () => {
            showNotification('Learn more about our features', 'info');
        });
    }
    
    // Demo functionality - only if elements exist
    const demoInput = document.getElementById('demo-input');
    const demoBtn = document.getElementById('demo-btn');
    const demoList = document.getElementById('demo-list');
    
    if (demoBtn && demoInput && demoList) {
        demoBtn.addEventListener('click', addItem);
        demoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addItem();
        });
        
        function addItem() {
            const value = demoInput.value.trim();
            if (!value) return;
            
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span class="text-white">${escapeHtml(value)}</span>
                <button class="text-red-500 hover:text-red-700 transition-colors" onclick="removeItem(this)">
                    Remove
                </button>
            `;
            
            demoList.appendChild(item);
            demoInput.value = '';
            showNotification('Item added successfully!', 'success');
        }
    }
    
    // Global function for removing items
    window.removeItem = function(button) {
        button.closest('.list-item').remove();
        showNotification('Item removed', 'info');
    };
    
    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${getNotificationClasses(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function getNotificationClasses(type) {
        const classes = {
            success: 'bg-green-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white'
        };
        return classes[type] || classes.info;
    }
});