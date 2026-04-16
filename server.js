const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); //

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN CONEXIÓN AIVEN
const db = mysql.createConnection({
    host: 'mysql-1c60500c-utem-7be9.a.aivencloud.com', //
    port: 20678,                                     //
    user: 'avnadmin',                                //
    password: 'AVNS_Cdo5T1GzuWHqxWDZv7U',            //
    database: 'defaultdb',                           //
    ssl: { 
        rejectUnauthorized: false                    // Requerido para Aiven
    }
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a Aiven:', err);
        return;
    }
    console.log('✅ API conectada a la nube (Aiven) con mysql2');

    // ESTO CREA LA TABLA AUTOMÁTICAMENTE SI NO EXISTE
    const sqlSchema = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        fecha_registro DATE,
        edad INT,
        fecha_nacimiento DATE,
        estatura FLOAT,
        peso FLOAT,
        genotipo VARCHAR(50),
        foto_url TEXT
    )`;

    db.query(sqlSchema, (err) => {
        if (err) console.log("❌ Error creando tabla:", err);
        else console.log("🚀 Tabla 'usuarios' confirmada/lista en Aiven");
    });
});

// --- RUTA: OBTENER TODOS LOS USUARIOS (GET) ---
app.get('/api/v1/users', (req, res) => {
    const sql = 'SELECT * FROM usuarios ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- RUTA: GUARDAR NUEVO USUARIO (POST) ---
app.post('/api/v1/users', (req, res) => {
    const { name, email, phone, fecha_registro, edad, fecha_nacimiento, estatura, peso, genotipo, foto_url } = req.body;
    
    const sql = `INSERT INTO usuarios 
                 (name, email, phone, fecha_registro, edad, fecha_nacimiento, estatura, peso, genotipo, foto_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                 
    const valores = [name, email, phone, fecha_registro, edad, fecha_nacimiento, estatura, peso, genotipo, foto_url];

    db.query(sql, valores, (err, result) => {
        if (err) return res.status(500).json({ error: 'Fallo al guardar en la nube: ' + err.message });
        res.status(201).json({ message: '¡Usuario guardado con éxito en la nube!', id: result.insertId });
    });
});

// --- RUTA: ELIMINAR USUARIO (DELETE) ---
app.delete('/api/v1/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario eliminado' });
    });
});

// CONFIGURACIÓN DE PUERTO PARA RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});