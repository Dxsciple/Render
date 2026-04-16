const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: 'mysql-1c60500c-utem-7be9.a.aivencloud.com',
    port: 20678,
    user: 'avnadmin',
    password: 'AVNS_Cdo5T1GzuWHqxWDZv7U',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
});

// Verificación de conexión
db.connect((err) => {
    if (err) return console.error('❌ Error Aiven:', err);
    console.log('✅ Conectado a Aiven');
    
    // Crear tabla si no existe con los nombres exactos del formulario
    const createTable = `CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        fecha_registro VARCHAR(50),
        edad VARCHAR(10),
        genotipo VARCHAR(50),
        foto_url TEXT
    )`;
    db.query(createTable, (err) => {
        if (err) console.log("Error tabla:", err);
    });
});

app.get('/api/v1/users', (req, res) => {
    db.query('SELECT * FROM usuarios ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/v1/users', (req, res) => {
    const { name, email, phone, fecha_registro, edad, genotipo, foto_url } = req.body;
    const sql = `INSERT INTO usuarios (name, email, phone, fecha_registro, edad, genotipo, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, email, phone, fecha_registro, edad, genotipo, foto_url];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error al insertar:", err);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});