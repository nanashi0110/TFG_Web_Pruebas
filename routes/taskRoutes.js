const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware'); // El guardia de seguridad

// Rutas protegidas para las tareas
router.post('/', authMiddleware, taskController.crearTarea);
router.get('/', authMiddleware, taskController.obtenerTareas);
router.put('/:id', authMiddleware, taskController.actualizarTarea);
router.delete('/:id', authMiddleware, taskController.borrarTarea);

module.exports = router;