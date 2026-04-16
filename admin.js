const API_URL = 'https://render-a5tw.onrender.com/api/v1/users';

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        const tableBody = document.getElementById('table-body');
        document.getElementById('total-users').textContent = users.length;
        
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${user.foto_url || 'https://via.placeholder.com/45'}" class="user-avatar" style="width:45px; border-radius:50%"></td>
                <td>${user.name}<br><small>${user.email}</small></td>
                <td>${user.edad || '--'}</td>
                <td>${user.genotipo || '--'}</td>
                <td>${user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : '--'}</td>
                <td><button onclick="deleteUser(${user.id})" class="btn-delete">Borrar</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) { console.error("Error cargando tabla:", e); }
}

async function deleteUser(id) {
    if (confirm('¿Eliminar usuario?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        renderTable();
    }
}

document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        fecha_registro: document.getElementById('fecha').value,
        edad: document.getElementById('edad').value,
        genotipo: document.getElementById('genotipo').value,
        foto_url: document.getElementById('foto').value
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    renderTable();
    document.getElementById('user-modal').classList.remove('show');
});

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    document.getElementById('fecha-hoy').textContent = new Date().toLocaleDateString();
});