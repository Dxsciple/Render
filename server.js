const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1. Servir archivos estáticos (Esto conecta el HTML, CSS y JS)
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: 'mysql-1c60500c-utem-7be9.a.aivencloud.com',
    port: 20678,
    user: 'avnadmin',
    password: 'AVNS_Cdo5T1GzuWHqxWDZv7U',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if (err) return console.error('❌ Error Aiven:', err);
    console.log('✅ Conectado a Aiven');
    
    const initTable = `CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        fecha_registro VARCHAR(50),
        edad VARCHAR(10),
        genotipo VARCHAR(50),
        foto_url TEXT
    )`;
    db.query(initTable, (err) => {
        if (err) console.error("Error al crear/verificar tabla:", err);
    });
});

// ✅ 2. RUTA PRINCIPAL (Para que cargue el login al entrar al link)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes (Tus rutas que ya funcionan perfecto)
app.get('/api/v1/users', (req, res) => {
    db.query('SELECT * FROM usuarios ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/v1/users', (req, res) => {
    const { name, email, phone, fecha_registro, edad, genotipo, foto_url } = req.body;
    const sql = `INSERT INTO usuarios (name, email, phone, fecha_registro, edad, genotipo, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, phone, fecha_registro, edad, genotipo, foto_url], (err, result) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId });
    });
});

app.delete('/api/v1/users/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Eliminado' });
    });
});

// ✅ 3. PARCHE DE CIERRE DE SESIÓN
// Si pides cualquier cosa que no sea la API, te manda al index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});