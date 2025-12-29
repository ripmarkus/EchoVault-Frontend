import { AuthManager, showSuccess, showError } from "./auth-utils.js";



document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordField = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');

    // Password visibility toggle
    toggleBtn.addEventListener('click', function() {
        const isPassword = passwordField.type === 'password';
        passwordField.type = isPassword ? 'text' : 'password';

        if (isPassword) {
            eyeIcon.innerHTML = '<path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>';
        } else {
            eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
        }
    });

    AuthManager.getCurrentUser().then(user => {
        if (user) window.location.href = '../../html/home.html';
    });

    // Auto-fill remembered email
    const rememberedEmail = AuthManager.getRememberedEmail();
    if (rememberedEmail) {
        const emailField = document.getElementById('email');
        const rememberCheckbox = document.getElementById('remember-me');
        if (emailField && rememberCheckbox) {
            emailField.value = rememberedEmail;
            rememberCheckbox.checked = true;
        }
    }

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordField.value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        const submitBtn = document.getElementById('login-btn');
        const btnText = submitBtn.querySelector('.login-text');
        const spinner = submitBtn.querySelector('.login-spinner');

        // Show loading
        submitBtn.disabled = true;
        btnText.textContent = 'Signing in...';
        spinner.classList.remove('hidden');

        try {
            await AuthManager.loginUser(email, password, rememberMe);
            showSuccess('Login successful!');
            setTimeout(() => window.location.href = '../../html/home.html', 1000);
        } catch (error) {
            showError(error.message || 'Login failed');
            submitBtn.disabled = false;
            btnText.textContent = 'Login';
            spinner.classList.add('hidden');
        }
    });
});

const loginContainer = `
<div class="w-full max-w-xl bg-gray-800 p-8 space-y-6 min-h-[700px]">
        <!-- Header -->
            <div class="text-center">
                <h1 class="text-7xl font-bold mb-2">EchoVault</h1>
                <h2 class="text-2xl font-semibold text-gray-300">Login</h2>
            </div>

            <!-- Login Form -->
            <form id="login-form" class="space-y-6">
                <!-- Google Login -->
                <div class="space-y-4">
                    <a href="http://95.217.216.2:8080/oauth2/authorization/google"
                       class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden
              px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-600 transition-all duration-200">
                        <!-- Icon -->
                        <span class="flex items-center justify-center mr-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
        </span>
                        <span class="text-gray-300 text-sm font-medium">Continue with Google</span>
                    </a>
                </div>

                <!-- OR Divider -->
                <div class="flex items-center my-6">
                    <div class="flex-1 border-t border-gray-600"></div>
                    <span class="mx-4 text-gray-400">or</span>
                    <div class="flex-1 border-t border-gray-600"></div>
                </div>

                <!-- Email Input -->
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-gray-300 mb-1">Email</label>
                        <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span class="flex items-center justify-center px-3 text-gray-400">
                            <img src="../imgs/login/icons8-email-100.png" alt="email" class="w-5 h-5">
                        </span>
                            <input type="email" id="email" placeholder="Email"
                                   class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                                   required autofocus>
                        </div>
                    </div>

                    <!-- Password Input -->
                    <div>
                        <label for="password" class="block text-gray-300 mb-1">Password</label>
                        <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span class="flex items-center justify-center px-3 text-gray-400">
                            <img src="../imgs/login/icons8-lock-100.png" alt="lock" class="w-5 h-5">
                        </span>
                            <input type="password" id="password" placeholder="Password"
                                   class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                                   required>
                            <button type="button" id="toggle-password" class="px-3 py-2 text-gray-400 hover:text-white">
                                <svg id="eye-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>

                <!-- Remember Me -->
                <div class="flex items-center space-x-2">
                    <input type="checkbox" name="remember-me" id="remember-me" class="h-4 w-4">
                    <label for="remember-me" class="text-gray-300">Remember me</label>
                </div>

                <!-- Login Button -->
                <button type="submit" id="login-btn"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="login-text">Login</span>
                    <div class="login-spinner hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </button>

                <!-- Register Link -->
                <div class="text-center mt-4">
                    <button type="button" onclick="showRegister()" class="text-blue-400 hover:underline">
                        Sign up
                    </button>
                </div>

                <!-- Forgot Password -->
                <div class="text-center">
                    <a href="#" class="text-blue-400 hover:underline text-sm">Forgot your password?</a>
                </div>
            </form>
        </div>
`;

export function loadLoginContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = loginContainer;
    }
}