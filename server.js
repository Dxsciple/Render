const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Servir archivos estáticos para que cargue el CSS y JS
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
    console.log('✅ Servidor conectado a la base de datos');
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
    db.query(sql, [name, email, phone, fecha_registro, edad, genotipo, foto_url], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId });
    });
});

app.delete('/api/v1/users/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario eliminado' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});