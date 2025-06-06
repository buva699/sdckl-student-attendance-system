const API_BASE_URL = "/api";

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const usernameInput = loginForm.username;
  const passwordInput = loginForm.password;
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  // Clear error messages
  function clearErrors() {
    errorMsg.classList.add('hidden');
    usernameError.classList.add('hidden');
    passwordError.classList.add('hidden');
  }

  // Validate form inputs
  function validateForm() {
    let valid = true;
    if (!usernameInput.value.trim()) {
      usernameError.classList.remove('hidden');
      valid = false;
    } else {
      usernameError.classList.add('hidden');
    }
    if (!passwordInput.value.trim()) {
      passwordError.classList.remove('hidden');
      valid = false;
    } else {
      passwordError.classList.add('hidden');
    }
    return valid;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) {
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const response = await fetch(API_BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }
      const data = await response.json();
      sessionStorage.setItem("sdcklToken", data.token);
      sessionStorage.setItem("sdcklUserRole", data.user.role);
      sessionStorage.setItem("sdcklUsername", data.user.username);

      // Redirect based on role
      if (data.user.role === "admin" || data.user.role === "teacher") {
        window.location.href = "dashboard.html";
      } else if (data.user.role === "student") {
        window.location.href = "profile.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (error) {
      errorMsg.textContent = error.message;
      errorMsg.classList.remove("hidden");
    }
  });

  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Password reset feature is not implemented yet.');
  });
});
