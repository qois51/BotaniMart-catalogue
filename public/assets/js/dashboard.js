// Grafik Trafik Produk
const trafficChart = document.getElementById('trafficChart').getContext('2d');
let trafficChartInstance = null;

// Fungsi untuk update grafik dengan data views produk
function updateTrafficChart(products) {
  const labels = products.map(p => p.namaProduk); // ambil namaProduk
  const viewsData = products.map(p => p.views);

  const trafficData = {
    labels: labels,
    datasets: [{
      label: 'Views Produk',
      data: viewsData,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `Views: ${tooltipItem.raw}`;
          }
        }
      }
    }
  };

  if (trafficChartInstance) {
    trafficChartInstance.data = trafficData;
    trafficChartInstance.options = chartOptions;
    trafficChartInstance.update();
  } else {
    trafficChartInstance = new Chart(trafficChart, {
      type: 'bar',
      data: trafficData,
      options: chartOptions
    });
  }
}

// Fungsi untuk Menambahkan Data ke Tabel Produk
function addDataToTable(productData) {
  const tableBody = document.querySelector('.product-table tbody');
  tableBody.innerHTML = '';

  productData.forEach(product => {
    const row = document.createElement('tr');

    const cell1 = document.createElement('td');
    cell1.textContent = product.namaProduk;
    row.appendChild(cell1);

    const cell2 = document.createElement('td');
    cell2.textContent = product.kategoriMain;
    row.appendChild(cell2);

    const cell3 = document.createElement('td');
    cell3.textContent = product.views;
    row.appendChild(cell3);

    const cell4 = document.createElement('td');
    cell4.textContent = product.rank; // Rank akan ditambahkan saat fetch
    row.appendChild(cell4);

    tableBody.appendChild(row);
  });
}

// Fetch data produk dari backend
async function fetchProductData() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch product data');
    let products = await response.json();

    // Urutkan produk berdasarkan views tertinggi untuk assign rank
    products.sort((a, b) => b.views - a.views);
    products = products.map((p, index) => ({ ...p, rank: index + 1 }));

    addDataToTable(products);
    updateTrafficChart(products);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

// Event DOM siap, fetch data user dan produk
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/auth/current-user');
    const data = await response.json();

    if (data.loggedIn) {
      const userHeader = document.querySelector('.menu-user-header');
      if (userHeader) {
        userHeader.innerHTML = `<i class="fas fa-user"></i> ${data.user.name}`;
      }
      console.log('Logged in as:', data.user.name);
    } else {
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
  }

  fetchProductData();

  const logoutButton = document.querySelector('.dropdown-profile .dropdown-item:nth-child(2)');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          window.location.href = '/admin';
        } else {
          alert('Failed to logout. Please try again.');
        }
      } catch (error) {
        alert('An error occurred during logout. Please try again.');
      }
    });
  }
});

// Dropdown profile toggle
const profileIcon = document.querySelector('.profile-icon');
const dropdownMenu = document.querySelector('.dropdown-profile');
profileIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
});
document.addEventListener('click', () => {
  dropdownMenu.style.display = 'none';
});