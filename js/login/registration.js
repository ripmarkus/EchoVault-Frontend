import { AuthManager, showSuccess, showError, generateStrongPassword } from "./auth-utils.js";

function setupRegistrationEventListeners() {
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const passwordMatch = document.getElementById('password-match');
    const generateBtn = document.getElementById('generate-password');
    const togglePasswordBtn = document.getElementById('reg-toggle-password');

    // Check if already logged in
    AuthManager.getCurrentUser().then(user => {
        if (user) window.location.href = '/dashboard';
    });

    // Password matching validation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                passwordMatch.textContent = '✓ Passwords match';
                passwordMatch.className = 'text-sm mt-1 text-green-500';
                passwordMatch.classList.remove('hidden');
            } else {
                passwordMatch.textContent = '✗ Passwords do not match';
                passwordMatch.className = 'text-sm mt-1 text-red-500';
                passwordMatch.classList.remove('hidden');
            }
        } else {
            passwordMatch.classList.add('hidden');
        }
    });

    // Generate strong password
    generateBtn.addEventListener('click', function() {
        const password = generateStrongPassword(16);
        passwordInput.value = password;
        confirmPasswordInput.value = password;
        confirmPasswordInput.dispatchEvent(new Event('input'));
    });

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        const eyeIcon = document.getElementById('reg-eye-icon');
        if (isPassword) {
            eyeIcon.innerHTML = '<path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>';
        } else {
            eyeIcon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
        }
    });

    // Form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const termsChecked = document.getElementById('terms-checkbox').checked;

        // Simple validation
        if (!name || !email || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        if (!termsChecked) {
            showError('Please accept the Terms of Service');
            return;
        }

        const submitBtn = document.getElementById('register-btn');
        const btnText = submitBtn.querySelector('.register-text');
        const spinner = submitBtn.querySelector('.register-spinner');

        // Show loading
        submitBtn.disabled = true;
        btnText.textContent = 'Creating Account...';
        spinner.classList.remove('hidden');

        try {
            await AuthManager.registerUser(email, name, password);
            showSuccess('Account created! You can now log in.');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } catch (error) {
            showError(error.message || 'Registration failed');
            submitBtn.disabled = false;
            btnText.textContent = 'Create Account';
            spinner.classList.add('hidden');
        }
    });
}

const registrationContainer =
    `
<div class="w-full max-w-xl bg-gray-800 p-8 space-y-6 min-h-[700px]">
        <!-- Header -->
            <div class="text-center">
                <h1 class="text-6xl font-bold mb-2">EchoVault</h1>
                <h2 class="text-2xl font-semibold text-gray-300">Create Account</h2>
            </div>

            <!-- Registration Form -->
            <form id="register-form" class="space-y-4">
                <!-- Google Registration -->
                <div class="space-y-4">
                    <a href="/oauth2/authorization/google"
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
                        <span class="text-gray-300 text-sm font-medium">Sign up with Google</span>
                    </a>
                </div>

                <!-- OR Divider -->
                <div class="flex items-center my-4">
                    <div class="flex-1 border-t border-gray-600"></div>
                    <span class="mx-4 text-gray-400">or</span>
                    <div class="flex-1 border-t border-gray-600"></div>
                </div>

                <!-- Full Name Input -->
                <div>
                    <label for="reg-name" class="block text-gray-300 mb-1">Full Name</label>
                    <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span class="flex items-center justify-center px-3 text-gray-400">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                        </span>
                        <input type="text" id="reg-name" placeholder="Enter your full name"
                               class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                               required autofocus>
                    </div>
                </div>

                <!-- Email Input -->
                <div>
                    <label for="reg-email" class="block text-gray-300 mb-1">Email</label>
                    <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span class="flex items-center justify-center px-3 text-gray-400">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </span>
                        <input type="email" id="reg-email" placeholder="Enter your email"
                               class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                               required>
                    </div>
                </div>

                <!-- Password Input with Generator -->
                <div>
                    <label for="reg-password" class="block text-gray-300 mb-1">Password</label>
                    <div class="space-y-2">
                        <div class="flex">
                            <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 flex-1">
                                <span class="flex items-center justify-center px-3 text-gray-400">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                                    </svg>
                                </span>
                                <input type="password" id="reg-password" placeholder="Enter a strong password"
                                       class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                                       required>
                                <button type="button" id="reg-toggle-password" class="px-3 py-2 text-gray-400 hover:text-white">
                                    <svg id="reg-eye-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                    </svg>
                                </button>
                            </div>
                            <button type="button" id="generate-password" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-blue-600 transition-colors">
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Confirm Password -->
                <div>
                    <label for="reg-confirm-password" class="block text-gray-300 mb-1">Confirm Password</label>
                    <div class="flex items-center bg-gray-700 border border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <span class="flex items-center justify-center px-3 text-gray-400">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"/>
                            </svg>
                        </span>
                        <input type="password" id="reg-confirm-password" placeholder="Confirm your password"
                               class="flex-1 bg-gray-700 text-white px-3 py-2 focus:outline-none"
                               required>
                    </div>
                    <div id="password-match" class="text-sm mt-1 hidden"></div>
                </div>


                <!-- Register Button -->
                <button type="submit" id="register-btn"
                        class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold bg-[#55A5F8] text-white hover:bg-[#3F8CE0] focus:outline-none focus:ring-2 focus:ring-[#55A5F8] focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="register-text">Create Account</span>
                    <div class="register-spinner hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </button>

                <!-- Login Link -->
                <div class="text-center mt-4">
                    <span class="text-gray-400">Already have an account? </span>
                    <button type="button" onclick="showLogin()" class="text-blue-400 hover:underline">
                        Sign in
                    </button>
                </div>
            </form>
        </div>
`;

export function loadRegistrationContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = registrationContainer;
        setupRegistrationEventListeners();
    }
}