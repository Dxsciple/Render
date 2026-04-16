// 👇 CAMBIADO: Ahora apunta a tu servidor en Render
const API_URL = 'https://render-a5tw.onrender.com/api/v1/users';

const tableBody = document.getElementById('table-body');
const totalUsersDisplay = document.getElementById('total-users');
const fechaHoyDisplay = document.getElementById('fecha-hoy');

const modal = document.getElementById('user-modal');
const modalTitle = document.getElementById('modal-title');
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const closeModalBtn = document.querySelector('.close-btn');
const btnNuevo = document.getElementById('btn-nuevo');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const fechaInput = document.getElementById('fecha');
const nacimientoInput = document.getElementById('nacimiento');
const edadInput = document.getElementById('edad');
const estaturaInput = document.getElementById('estatura');
const pesoInput = document.getElementById('peso');
const genotipoInput = document.getElementById('genotipo');
const fotoInput = document.getElementById('foto');

// Protección para que no falle si no encuentra la fecha
if (fechaHoyDisplay) {
    fechaHoyDisplay.textContent = new Date().toLocaleDateString('es-ES');
}

async function renderTable() {
    try {
        const response = await fetch(API_URL);
        const db = await response.json();

        if (totalUsersDisplay) {
            totalUsersDisplay.textContent = db.length;
        }
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (db.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Sin usuarios registrados en la nube.</td></tr>`;
                return;
            }

            db.forEach(user => {
                let fechaTexto = '---';
                if (user.fecha_registro) {
                    const f = new Date(user.fecha_registro);
                    const offset = f.getTimezoneOffset() * 60000; 
                    fechaTexto = new Date(f.getTime() + offset).toLocaleDateString('es-ES');
                }

                const avatar = user.foto_url ? user.foto_url : 'https://via.placeholder.com/45/333333/39FF14?text=Foto';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${avatar}" class="user-avatar" alt="Foto"></td>
                    <td>${user.name}<br><small style="color:#888">${user.email}</small></td>
                    <td>${user.edad || '--'} años</td>
                    <td>${user.genotipo || '--'}</td>
                    <td style="color: var(--primary-color); font-weight: bold;">${fechaTexto}</td>
                    <td>
                        <button class="btn btn-edit" onclick='loadUserForEdit(${JSON.stringify(user)})'>Editar</button>
                        <button class="btn btn-delete" onclick="confirmDelete(${user.id})">Borrar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error al cargar datos desde Render:", error);
    }
}

async function createUser(user) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            alert('❌ Hubo un error al guardar: ' + (errorData.error || 'Verifica los datos.'));
            return;
        }
        renderTable();
    } catch (error) {
        alert('❌ Error al conectar con el servidor en Render.');
        console.error(error);
    }
}

async function updateUser(user) {
    try {
        // Nota: Asegúrate que tu backend soporte PUT en esta ruta o usa POST según tu server.js
        const response = await fetch(`${API_URL}/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            alert('❌ Error al actualizar el usuario');
            return;
        }
        renderTable();
    } catch (error) {
        console.error(error);
    }
}

async function deleteUser(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        renderTable();
    } catch (error) {
        console.error("Error al borrar:", error);
    }
}

window.loadUserForEdit = function(user) {
    if(!modal) return;
    
    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    phoneInput.value = user.phone;
    edadInput.value = user.edad || '';
    estaturaInput.value = user.estatura || '';
    pesoInput.value = user.peso || '';
    genotipoInput.value = user.genotipo || '';
    fotoInput.value = user.foto_url || '';

    if (user.fecha_registro) fechaInput.value = user.fecha_registro.split('T')[0];
    if (user.fecha_nacimiento) nacimientoInput.value = user.fecha_nacimiento.split('T')[0];

    document.getElementById('modal-title').textContent = 'Editar Ficha Médica';
    modal.classList.add('show');
};

window.confirmDelete = function(id) {
    if (confirm('¿Seguro que deseas borrar este usuario?')) deleteUser(id);
};

// Carga inicial
document.addEventListener('DOMContentLoaded', renderTable);

if (btnNuevo) {
    btnNuevo.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Nueva Ficha';
        userForm.reset();
        userIdInput.value = '';
        
        const hoy = new Date();
        const offset = hoy.getTimezoneOffset() * 60000;
        fechaInput.value = new Date(hoy.getTime() - offset).toISOString().split('T')[0];

        modal.classList.add('show');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
}

if (userForm) {
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = userIdInput.value;
        
        const user = {
            id: id ? parseInt(id) : null,
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value || null,
            fecha_registro: fechaInput.value || null,
            fecha_nacimiento: nacimientoInput.value || null,
            edad: edadInput.value ? parseInt(edadInput.value) : null,
            estatura: estaturaInput.value ? parseFloat(estaturaInput.value) : null,
            peso: pesoInput.value ? parseFloat(pesoInput.value) : null,
            genotipo: genotipoInput.value || null,
            foto_url: fotoInput.value || null
        };

        if (id) updateUser(user); else createUser(user);
        modal.classList.remove('show');
    });
}