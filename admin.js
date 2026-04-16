const API_URL = 'https://render-a5tw.onrender.com/api/v1/users';

// Función para cargar la tabla
async function renderTable() {
    try {
        console.log("Intentando cargar datos de:", API_URL);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error en el servidor");
        const users = await response.json();
        
        const tableBody = document.getElementById('table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${user.foto_url || ''}" style="width:40px; border-radius:50%"></td>
                    <td>${user.name}</td>
                    <td>${user.edad || '--'}</td>
                    <td>${user.genotipo || '--'}</td>
                    <td>${user.fecha_registro || '--'}</td>
                    <td><button onclick="deleteUser(${user.id})" style="background:red; color:white; border:none; cursor:pointer">Borrar</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
        if(document.getElementById('total-users')) {
            document.getElementById('total-users').textContent = users.length;
        }
    } catch (e) { 
        console.error("Error cargando tabla:", e); 
    }
}

// Función para borrar
window.deleteUser = async function(id) {
    if (confirm('¿Eliminar usuario?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        renderTable();
    }
};

// Configuración del Formulario
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    
    const userForm = document.getElementById('user-form');
    const modal = document.getElementById('user-modal');
    const btnNuevo = document.getElementById('btn-nuevo');
    const btnCerrar = document.querySelector('.close-btn');

    if (btnNuevo) {
        btnNuevo.onclick = () => modal.style.display = 'flex';
    }
    if (btnCerrar) {
        btnCerrar.onclick = () => modal.style.display = 'none';
    }

    if (userForm) {
        userForm.onsubmit = async (e) => {
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

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                if(res.ok) {
                    alert("¡Usuario guardado!");
                    userForm.reset();
                    modal.style.display = 'none';
                    renderTable();
                } else {
                    alert("Error al guardar en la base de datos");
                }
            } catch (err) {
                alert("No hay conexión con el servidor");
            }
        };
    }
});