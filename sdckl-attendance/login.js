document.addEventListener('DOMContentLoaded', () => {
  const fingerprintBtn = document.getElementById('fingerprint-btn');
  const scanStatus = document.getElementById('scan-status');
  const cancelScanBtn = document.createElement('button');
  cancelScanBtn.textContent = 'Cancel';
  cancelScanBtn.className = 'ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400';
  cancelScanBtn.style.display = 'none';
  cancelScanBtn.style.position = 'relative';
  cancelScanBtn.style.zIndex = '10';

  fingerprintBtn.parentNode.appendChild(cancelScanBtn);

  let scanTimeout = null;

  fingerprintBtn.addEventListener('click', () => {
    fingerprintBtn.disabled = true;
    cancelScanBtn.style.display = 'inline-block';
    scanStatus.textContent = 'Scanning...';

    scanTimeout = setTimeout(() => {
      scanStatus.textContent = 'Authentication successful';
      fingerprintBtn.disabled = false;
      cancelScanBtn.style.display = 'none';

      sessionStorage.setItem('sdcklLoggedIn', 'true');
      sessionStorage.setItem('sdcklUser', JSON.stringify({ username: 'biometricUser' }));

      window.location.href = 'index.html';
    }, 2000);
  });

  cancelScanBtn.addEventListener('click', () => {
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    scanStatus.textContent = 'Idle';
    fingerprintBtn.disabled = false;
    cancelScanBtn.style.display = 'none';
  });

  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember');

  // Create inline error message containers
  const usernameError = document.createElement('p');
  usernameError.className = 'text-red-600 text-sm mt-1 hidden';
  usernameInput.parentNode.appendChild(usernameError);

  const passwordError = document.createElement('p');
  passwordError.className = 'text-red-600 text-sm mt-1 hidden';
  passwordInput.parentNode.appendChild(passwordError);

  const formError = document.createElement('p');
  formError.className = 'text-red-600 text-sm mt-2 hidden text-center';
  loginForm.appendChild(formError);

  // Show/hide password toggle
  const togglePasswordBtn = document.createElement('button');
  togglePasswordBtn.type = 'button';
  togglePasswordBtn.className = 'absolute right-3 top-2 text-gray-600 hover:text-gray-900 focus:outline-none';
  togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
  passwordInput.parentNode.style.position = 'relative';
  passwordInput.parentNode.appendChild(togglePasswordBtn);

  togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = 'password';
      togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });

  // Loading spinner for submit button
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const spinner = document.createElement('span');
  spinner.className = 'ml-2 inline-block w-4 h-4 border-2 border-t-2 border-gray-200 rounded-full animate-spin';
  spinner.style.display = 'none';
  submitBtn.appendChild(spinner);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    usernameError.textContent = '';
    usernameError.classList.add('hidden');
    passwordError.textContent = '';
    passwordError.classList.add('hidden');
    formError.textContent = '';
    formError.classList.add('hidden');

    let valid = true;
    if (!usernameInput.value.trim()) {
      usernameError.textContent = 'Username is required.';
      usernameError.classList.remove('hidden');
      valid = false;
    }
    if (!passwordInput.value.trim()) {
      passwordError.textContent = 'Password is required.';
      passwordError.classList.remove('hidden');
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';

    const API_BASE_URL = 'http://localhost:3001/api';

    try {
      const response = await fetch(API_BASE_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value.trim(),
          password: passwordInput.value.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        formError.textContent = 'Login failed: ' + (errorData.error || 'Invalid credentials');
        formError.classList.remove('hidden');
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        return;
      }

      const data = await response.json();
      sessionStorage.setItem('sdcklLoggedIn', 'true');
      sessionStorage.setItem('sdcklUser', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } catch (error) {
      formError.textContent = 'Login error: ' + error.message;
      formError.classList.remove('hidden');
      submitBtn.disabled = false;
      spinner.style.display = 'none';
    }
  });
});
