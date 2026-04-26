const Task = require('../models/Task');

// 1. CREAR UNA TAREA
exports.crearTarea = async (req, res) => {
  try {
    const nuevaTarea = new Task(req.body);
    await nuevaTarea.save();
    
    // Devolvemos la tarea con los datos del cliente incrustados usando 'populate'
    const tareaGuardada = await Task.findById(nuevaTarea._id).populate('clienteId', 'nombreEmpresa personaContacto');
    
    res.status(201).json(tareaGuardada);
  } catch (error) {
    console.error("Error al crear tarea:", error.message);
    res.status(500).json({ mensaje: "Error al crear la tarea" });
  }
};

// 2. OBTENER TODAS LAS TAREAS (Y rellenar los datos del cliente)
exports.obtenerTareas = async (req, res) => {
  try {
    // populate('clienteId', 'nombreEmpresa') trae solo el nombre de la empresa de la otra tabla
    const tareas = await Task.find().populate('clienteId', 'nombreEmpresa').sort({ fechaVencimiento: 1 }); 
    res.json(tareas);
  } catch (error) {
    console.error("Error al obtener tareas:", error.message);
    res.status(500).json({ mensaje: "Error al obtener las tareas" });
  }
};

// 3. ACTUALIZAR UNA TAREA (Con auditoría de tiempo y Auto-Clonado)
exports.actualizarTarea = async (req, res) => {
  try {
    const datosNuevos = { ...req.body };

    // Si nos piden marcarla como resuelta, guardamos el momento exacto
    if (datosNuevos.estado === 'Resuelta') {
      datosNuevos.fechaResolucion = new Date();
    } else if (datosNuevos.estado && datosNuevos.estado !== 'Resuelta') {
      // Si la "des-resuelven", borramos la fecha
      datosNuevos.fechaResolucion = null; 
    }

    // 1º Actualizamos la tarea actual
    const tareaActualizada = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: datosNuevos }, 
      { new: true }
    ).populate('clienteId', 'nombreEmpresa');

    if (!tareaActualizada) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    // 2º 🔄 LÓGICA DE RECURRENCIA (AUTO-CLONADO)
    // Solo generamos una nueva si acaba de ser resuelta Y además era recurrente
    if (datosNuevos.estado === 'Resuelta' && tareaActualizada.esRecurrente) {
      let proximaFecha = new Date(tareaActualizada.fechaVencimiento);

      // Calculamos la fecha de la siguiente actuación
      switch (tareaActualizada.tipoRecurrencia) {
        case 'Semanal': proximaFecha.setDate(proximaFecha.getDate() + 7); break;
        case 'Quincenal': proximaFecha.setDate(proximaFecha.getDate() + 15); break;
        case 'Mensual': proximaFecha.setMonth(proximaFecha.getMonth() + 1); break;
        case 'Trimestral': proximaFecha.setMonth(proximaFecha.getMonth() + 3); break;
        case 'Semestral': proximaFecha.setMonth(proximaFecha.getMonth() + 6); break;
        case 'Anual': proximaFecha.setFullYear(proximaFecha.getFullYear() + 1); break;
      }

      // Creamos la nueva tarea automática que nacerá como "Pendiente"
      const tareaSiguiente = new Task({
        titulo: tareaActualizada.titulo,
        descripcion: tareaActualizada.descripcion,
        clienteId: tareaActualizada.clienteId._id, // Pasamos el ID del cliente
        prioridad: tareaActualizada.prioridad,
        fechaVencimiento: proximaFecha,
        esRecurrente: true,
        tipoRecurrencia: tareaActualizada.tipoRecurrencia,
        estado: 'Pendiente' 
      });
      
      await tareaSiguiente.save();
      console.log(`🔄 InfraDesk: Tarea recurrente generada automáticamente para el ${proximaFecha.toLocaleDateString()}`);
    }

    // Devolvemos a React la tarea original que el usuario acaba de resolver
    res.json(tareaActualizada);
  } catch (error) {
    console.error("Error al actualizar tarea:", error.message);
    res.status(500).json({ mensaje: "Error al actualizar la tarea" });
  }
};

// 4. BORRAR UNA TAREA
exports.borrarTarea = async (req, res) => {
  try {
    const tareaBorrada = await Task.findByIdAndDelete(req.params.id);
    if (!tareaBorrada) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }
    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al borrar tarea:", error.message);
    res.status(500).json({ mensaje: "Error al borrar la tarea" });
  }
};