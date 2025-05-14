// Submit Form Handler
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const fullName = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      fullName: fullName,
      email: email,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      showAlert(data.error, 'error');
    } else {
      showAlert('Registrasi berhasil!', 'success');
      window.location.href = '/admin';
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    showAlert('Terjadi kesalahan pada server. Silakan coba lagi.', 'error');
  });
});

// Custom Alert Pop-up
function showAlert(message, type) {
  const oldAlert = document.getElementById('custom-alert');
  if (oldAlert) oldAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.id = 'custom-alert';
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '30px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.padding = '1rem 2rem';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.fontSize = '1rem';
  alertDiv.style.color = '#fff';
  alertDiv.style.background = type === 'success' ? '#28a745' : '#dc3545';
  alertDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Show/Hide Password
document.getElementById('togglePassword').addEventListener('change', function() {
  const passwordInput = document.getElementById('password');
  passwordInput.type = this.checked ? 'text' : 'password';
});

// Syarat Password Live Check
const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", function () {
  const val = passwordInput.value;
  document.getElementById("uppercase").checked = /[A-Z]/.test(val);
  document.getElementById("lowercase").checked = /[a-z]/.test(val);
  document.getElementById("number").checked = /\d/.test(val);
  document.getElementById("special").checked = /[\W_]/.test(val);
  document.getElementById("length").checked = val.length >= 8;
});

const toggle = document.getElementById('togglePassword');
const password = document.getElementById('password');

toggle.addEventListener('change', () => {
  password.type = toggle.checked ? 'text' : 'password';
});