require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- IMPORTACIONES DE RUTAS (Modulares) ---
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes'); // <-- NUEVO: Importamos el mapa de clientes
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = 3000;

// --- MIDDLEWARES GLOBALES ---
app.use(cors()); 
app.use(express.json()); 

// --- CONEXIÓN A MONGODB ---
const dbURL = `mongodb://root:${process.env.DB_PASSWORD}@localhost:27017/gestion_tecnica_db?authSource=admin`;

mongoose.connect(dbURL)
  .then(() => {
    console.log('✅ Conectado a MongoDB (Docker)');
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
  });

// ==========================================
// CONFIGURACIÓN DE ENDPOINTS (API REST)
// ==========================================

// Mensaje de bienvenida
app.get('/', function(req, res) {
  res.json({
    mensaje: "Bienvenido a la API del Sistema de Gestión Técnica",
    status: "Todo funciona"
  });
});

// Enrutador de Autenticación (/api/auth/...)
app.use('/api/auth', authRoutes);

// Enrutador de Clientes (/api/customers/...)
app.use('/api/customers', customerRoutes);

// Enrutador de Tareas (/api/tasks/...)
app.use('/api/tasks', taskRoutes);

// --- ARRANCAR EL SERVIDOR ---
app.listen(port, function() {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
});