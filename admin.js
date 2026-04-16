const API_URL = 'https://render-a5tw.onrender.com/api/v1/users';

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        const db = await response.json();
        const tableBody = document.getElementById('table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            db.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${user.foto_url || 'https://via.placeholder.com/45'}" class="user-avatar"></td>
                    <td>${user.name}<br><small>${user.email}</small></td>
                    <td>${user.edad || '--'}</td>
                    <td>${user.genotipo || '--'}</td>
                    <td>${user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '--'}</td>
                    <td><button onclick="deleteUser(${user.id})">Borrar</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (e) { console.error(e); }
}

async function deleteUser(id) {
    if (confirm('¿Borrar?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        renderTable();
    }
}

document.addEventListener('DOMContentLoaded', renderTable);