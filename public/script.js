document.getElementById('fetchBtn').addEventListener('click', () => {
  fetch('/api/hello')
    .then(res => res.json())
    .then(data => {
      document.getElementById('message').textContent = data.message;
    });
});