const form = document.getElementById('itemForm');
const tableBody = document.querySelector('#stockTable tbody');
const exportBtn = document.getElementById('exportBtn');

let stockData = JSON.parse(localStorage.getItem('stockData')) || [];
let editIndex = -1;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('itemName').value.trim();
  const system = parseInt(document.getElementById('stockSystem').value);
  const actual = parseInt(document.getElementById('stockActual').value);
  const diff = actual - system;

  const newItem = { name, system, actual, diff };

  if (editIndex >= 0) {
    stockData[editIndex] = newItem;
    editIndex = -1;
  } else {
    stockData.push(newItem);
  }

  localStorage.setItem('stockData', JSON.stringify(stockData));
  renderTable();
  form.reset();
});

function renderTable() {
  tableBody.innerHTML = '';
  stockData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.system}</td>
      <td>${item.actual}</td>
      <td>${item.diff}</td>
      <td>
        <button onclick="editItem(${index})">Edit</button>
        <button onclick="deleteItem(${index})">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

window.editItem = function(index) {
  const item = stockData[index];
  document.getElementById('itemName').value = item.name;
  document.getElementById('stockSystem').value = item.system;
  document.getElementById('stockActual').value = item.actual;
  editIndex = index;
};

window.deleteItem = function(index) {
  if (confirm('Yakin ingin menghapus item ini?')) {
    stockData.splice(index, 1);
    localStorage.setItem('stockData', JSON.stringify(stockData));
    renderTable();
  }
};

exportBtn.addEventListener('click', () => {
  const worksheet = XLSX.utils.json_to_sheet(stockData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "StockOpname");
  XLSX.writeFile(workbook, "stock_opname.xlsx");
});

window.onload = renderTable;

async function fetchStock() {
  const res = await fetch('http://localhost:5000/api/stock');
  const data = await res.json();
  stockData = data;
  renderTable();
}

async function addStock(item) {
  await fetch('http://localhost:5000/api/stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  fetchStock();
}

async function updateStock(id, item) {
  await fetch(`http://localhost:5000/api/stock/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  fetchStock();
}

async function deleteStock(id) {
  await fetch(`http://localhost:5000/api/stock/${id}`, { method: 'DELETE' });
  fetchStock();
}

