const trafficChart = document.getElementById('trafficChart').getContext('2d');
let trafficChartInstance = null;

function updateTrafficChart(products) {
  const labels = products.map(p => p.namaProduk);
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
    cell4.textContent = product.rank;
    row.appendChild(cell4);

    tableBody.appendChild(row);
  });
}

async function fetchProductData() {
  try {
    const response = await fetch('/api/products', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch product data');
    let products = await response.json();

    products.sort((a, b) => b.views - a.views);
    products = products.map((p, index) => ({ ...p, rank: index + 1 }));

    addDataToTable(products);
    updateTrafficChart(products);
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
}

async function checkAuthAndLoad() {
  try {
    const response = await fetch('/auth/check', {
      credentials: 'include'
    });

    if (!response.ok) {
      return window.location.href = '/admin';
    }

    const data = await response.json();

    const userHeader = document.querySelector('.menu-user-header');
    if (userHeader) {
      userHeader.innerHTML = `<i class="fas fa-user"></i> ${data.username}`;
    }

    fetchProductData();
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.href = '/admin';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthAndLoad();

  const logoutButton = document.querySelector('.dropdown-profile .logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      fetch('/auth/logout', { credentials: 'include' })
        .finally(() => {
          window.location.href = '/admin';
        });
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