const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

passwordInput.addEventListener("input", () => {
  togglePassword.style.display = passwordInput.value ? "inline" : "none";
});

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  const icon = togglePassword.querySelector("i");
  icon.classList.toggle("fa-eye");
  icon.classList.toggle("fa-eye-slash");
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    window.location.href = '/admin/admin-products';
  } else {
    alert(data.error || 'Login gagal');
  }
});