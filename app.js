require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos');
});

app.get('/productos-database', (req, res) => {
  const query = 'SELECT * FROM productos';
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
    res.json(result);
  });
});

app.post('/crear-producto', (req, res) => {
  const { id, nombre, cantidad } = req.body;

  const insertQuery = 'INSERT INTO productos (id, nombre, cantidad) VALUES (?, ?, ?)';

  connection.query(insertQuery, [id, nombre, cantidad], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.error('ID duplicado:', id);
        return res.status(400).json({ mensaje: 'ID de producto duplicado' });
      } else {
        console.error('Error al insertar producto:', err);
        return res.status(500).json({ mensaje: 'Error al registrar producto' });
      }
    }

    console.log(`Producto creado correctamente: ${nombre} -> ${id}`);
    res.status(201).json({ mensaje: 'Producto creado correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor esta corriendo en puerto :${PORT}`);
});
