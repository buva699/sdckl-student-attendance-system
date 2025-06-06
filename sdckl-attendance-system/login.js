const API_BASE_URL = "http://localhost:3001/api";

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      loginError.textContent = 'Please enter both username and password.';
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        loginError.textContent = errorData.error || 'Login failed';
        return;
      }

      const data = await response.json();
      localStorage.setItem('sdcklToken', data.token);
      localStorage.setItem('sdcklUser', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } catch (error) {
      loginError.textContent = 'Error during login: ' + error.message;
    }
  });
});
