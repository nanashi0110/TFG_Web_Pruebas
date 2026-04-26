const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String, 
    default: '' 
  },
  // RELACIÓN: Esto vincula la tarea con el cliente al que pertenece
  clienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  fechaVencimiento: { 
    type: Date, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'En Progreso', 'Resuelta'], 
    default: 'Pendiente' 
  },
  fechaResolucion: { 
    type: Date, 
    default: null 
  },
  prioridad: { 
    type: String, 
    enum: ['Baja', 'Media', 'Alta', 'Urgente'], 
    default: 'Media' 
  },
  
  // --- SISTEMA DE PERIODICIDAD ---
  esRecurrente: { 
    type: Boolean, 
    default: false 
  },
tipoRecurrencia: { 
    type: String, 
    // ✅ Hemos añadido Quincenal, Trimestral y Semestral a la lista permitida
    enum: ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Semestral', 'Anual', 'Ninguna'], 
    default: 'Ninguna' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);