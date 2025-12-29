// Simple auth utilities for Spring Security/OAuth2
class AuthManager {
    static getBaseURL() {
        // Use relative paths for API calls - they will use the current origin
        return '';
    }

    static async getCurrentUser() {
        try {
            const response = await fetch(this.getBaseURL() + '/api/auth/user', { credentials: 'include' });
            return response.ok ? await response.json() : null;
        } catch {
            return null;
        }
    }

    static async logout() {
        try {
            await fetch(this.getBaseURL() + '/logout', { method: 'POST', credentials: 'include' });
        } finally {
            // Clear remembered email if user logs out
            localStorage.removeItem('rememberedEmail');
            window.location.href = '/login.html';
        }
    }

    static async loginUser(email, password, rememberMe = false) {
        const response = await fetch(this.getBaseURL() + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, rememberMe })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        // Handle remember me functionality
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        return response.json();
    }

    static getRememberedEmail() {
        return localStorage.getItem('rememberedEmail');
    }

    static async registerUser(email, name, password) {
        const response = await fetch(this.getBaseURL() + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    }
}

// Simple notifications
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${bgColor} text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

const showSuccess = (msg) => showNotification(msg, 'success');
const showError = (msg) => showNotification(msg, 'error');

// Simple password generator
function generateStrongPassword(length = 16) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export { AuthManager, showSuccess, showError, generateStrongPassword };
