const API_BASE = 'http://localhost:3000/api';
document.addEventListener('DOMContentLoaded', loadData);

async function loadData(search = '', attribute = '') {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (attribute) params.append('attribute', attribute);

        const response = await fetch(`${API_BASE}/temperature?${params}`);
        const data = await response.json();
        
        displayData(data);
        toggleDownloadLinks(data.length > 0);
    } catch (error) {
        console.error('Greška pri učitavanju podataka:', error);
    }
}

function displayData(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${row.lokacija}</td>
        <td>${row.nadmorska_visina}</td>
        <td>${row.vrsta_lokacije}</td>
        <td>${row.latitude}</td>
        <td>${row.longitude}</td>
        <td>${row.senzor}</td>
        <td>${row.vrsta_mjerenja}</td>
        <td>${row.temperatura}°C</td>
        <td>${row.datum}</td>
        <td>${row.vrijeme}</td>
    `;
    tableBody.appendChild(tr);
});
}

function filterData() {
    const search = document.getElementById('searchInput').value;
    const attribute = document.getElementById('attributeSelect').value;
    loadData(search, attribute);
}

function clearFilter() {
    document.getElementById('searchInput').value = '';
    document.getElementById('attributeSelect').value = 'sve';
    loadData();
}

function toggleDownloadLinks(show) {
    document.getElementById('downloadLinks').style.display = show ? 'block' : 'none';
}

async function exportCSV() {
    const search = document.getElementById('searchInput').value;
    const attribute = document.getElementById('attributeSelect').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (attribute) params.append('attribute', attribute);

    window.open(`${API_BASE}/export/csv?${params}`);
}

async function exportJSON() {
    const search = document.getElementById('searchInput').value;
    const attribute = document.getElementById('attributeSelect').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (attribute) params.append('attribute', attribute);

    window.open(`${API_BASE}/export/json?${params}`);
}