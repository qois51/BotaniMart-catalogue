// Grafik Trafik Produk
const trafficChart = document.getElementById('trafficChart').getContext('2d');
const trafficData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'], //Label bulan bisa diganti
  datasets: [{
    label: 'Trend Trafik Produk',
    data: [500, 300, 400, 700, 600, 900], //Data trafik produk bisa diambil dari backend
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1
  }]
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(tooltipItem) {
          return `Views: ${tooltipItem.raw}`;
        }
      }
    }
  }
};

new Chart(trafficChart, {
  type: 'line',
  data: trafficData,
  options: chartOptions
});

//Fungsi untuk Menambahkan Data ke Tabel Produk
function addDataToTable(productData) {
  const tableBody = document.querySelector('.product-table tbody');
  tableBody.innerHTML = ''; //Clear the existing table data

  productData.forEach(product => {
    const row = document.createElement('tr');
    
    const cell1 = document.createElement('td');
    cell1.textContent = product.name;
    row.appendChild(cell1);
    
    const cell2 = document.createElement('td');
    cell2.textContent = product.category;
    row.appendChild(cell2);
    
    const cell3 = document.createElement('td');
    cell3.textContent = product.views;
    row.appendChild(cell3);
    
    const cell4 = document.createElement('td');
    cell4.textContent = product.rank;
    row.appendChild(cell4);

    tableBody.appendChild(row);
  });
}

// Contoh pengisian data produk (misalnya dari backend API)
const productData = [
  { name: 'Produk A', category: 'Kategori 1', views: 500, rank: 1 },
  { name: 'Produk B', category: 'Kategori 2', views: 300, rank: 2 },
  { name: 'Produk C', category: 'Kategori 3', views: 150, rank: 3 },
  { name: 'Produk D', category: 'Kategori 4', views: 700, rank: 4 }
];

// Panggil fungsi untuk mengisi data ke tabel
addDataToTable(productData);

const profileIcon = document.querySelector('.profile-icon');
const dropdownMenu = document.querySelector('.dropdown-profile');

profileIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
});

document.addEventListener('click', () => {
  dropdownMenu.style.display = 'none';
});

// Add this to dashboard.js after your existing code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch current user information
    const response = await fetch('/auth/current-user');
    const data = await response.json();
    
    if (data.loggedIn) {
      // Update the username in the dropdown menu
      const userHeader = document.querySelector('.menu-user-header');
      if (userHeader) {
        userHeader.innerHTML = `<i class="fas fa-user"></i> ${data.user.name}`;
      }
      
      console.log('Logged in as:', data.user.name);
    } else {
      // User is not logged in, redirect to login page
      console.log('No user logged in, redirecting to login page');
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
});

// Add this to dashboard.js after your existing code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch current user information
    const response = await fetch('/auth/current-user');
    const data = await response.json();
    
    if (data.loggedIn) {
      // Update the username in the dropdown menu
      const userHeader = document.querySelector('.menu-user-header');
      if (userHeader) {
        userHeader.innerHTML = `<i class="fas fa-user"></i> ${data.user.name}`;
      }
      
      console.log('Logged in as:', data.user.name);
    } else {
      // User is not logged in, redirect to login page
      console.log('No user logged in, redirecting to login page');
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
  
  // Add logout functionality
  const logoutButton = document.querySelector('.dropdown-profile .dropdown-item:nth-child(2)');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('Logged out successfully');
          // Redirect to login page after logout
          window.location.href = '/admin';
        } else {
          console.error('Logout failed');
          alert('Failed to logout. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout. Please try again.');
      }
    });
  }
});