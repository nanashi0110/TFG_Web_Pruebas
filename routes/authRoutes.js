const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Ya no necesitamos el middleware aquí para el registro público

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// RUTA PÚBLICA: Iniciar sesión
router.post('/login', authController.loginUsuario);

// ✅ RUTA AHORA PÚBLICA: Registrar usuario 
// Hemos quitado 'authMiddleware' para que puedas crear usuarios en cualquier deploy
router.post('/registro', authController.registrarUsuario);

module.exports = router;