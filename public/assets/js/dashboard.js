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

