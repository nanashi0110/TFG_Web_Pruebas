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

// 2. OBTENER TODAS LAS TAREAS
exports.obtenerTareas = async (req, res) => {
  try {
    const tareas = await Task.find().populate('clienteId', 'nombreEmpresa').sort({ fechaVencimiento: 1 }); 
    res.json(tareas);
  } catch (error) {
    console.error("Error al obtener tareas:", error.message);
    res.status(500).json({ mensaje: "Error al obtener las tareas" });
  }
};

// 3. ACTUALIZAR UNA TAREA (Con auditoría de tiempo y Auto-Clonado heredando horarios)
exports.actualizarTarea = async (req, res) => {
  try {
    const datosNuevos = { ...req.body };

    if (datosNuevos.estado === 'Resuelta') {
      datosNuevos.fechaResolucion = new Date();
    } else if (datosNuevos.estado && datosNuevos.estado !== 'Resuelta') {
      datosNuevos.fechaResolucion = null; 
    }

    const tareaActualizada = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: datosNuevos }, 
      { new: true }
    ).populate('clienteId', 'nombreEmpresa');

    if (!tareaActualizada) {
      return res.status(404).json({ mensaje: "Tarea no encontrada" });
    }

    // 🔄 LÓGICA DE RECURRENCIA (AUTO-CLONADO)
    if (datosNuevos.estado === 'Resuelta' && tareaActualizada.esRecurrente) {
      let proximaFecha = new Date(tareaActualizada.fechaVencimiento);

      switch (tareaActualizada.tipoRecurrencia) {
        case 'Semanal': proximaFecha.setDate(proximaFecha.getDate() + 7); break;
        case 'Quincenal': proximaFecha.setDate(proximaFecha.getDate() + 15); break;
        case 'Mensual': proximaFecha.setMonth(proximaFecha.getMonth() + 1); break;
        case 'Trimestral': proximaFecha.setMonth(proximaFecha.getMonth() + 3); break;
        case 'Semestral': proximaFecha.setMonth(proximaFecha.getMonth() + 6); break;
        case 'Anual': proximaFecha.setFullYear(proximaFecha.getFullYear() + 1); break;
      }

      // Creamos la nueva tarea heredando TODOS los ajustes de tiempo
      const tareaSiguiente = new Task({
        titulo: tareaActualizada.titulo,
        descripcion: tareaActualizada.descripcion,
        clienteId: tareaActualizada.clienteId._id,
        prioridad: tareaActualizada.prioridad,
        fechaVencimiento: proximaFecha,
        // ✅ HEREDAMOS EL HORARIO PERSONALIZADO
        horaInicio: tareaActualizada.horaInicio,
        horaFin: tareaActualizada.horaFin,
        todoElDia: tareaActualizada.todoElDia,
        esRecurrente: true,
        tipoRecurrencia: tareaActualizada.tipoRecurrencia,
        estado: 'Pendiente' 
      });
      
      await tareaSiguiente.save();
      console.log(`🔄 InfraDesk: Tarea recurrente generada para el ${proximaFecha.toLocaleDateString()} con horario ${tareaActualizada.todoElDia ? 'Todo el día' : tareaActualizada.horaInicio}`);
    }

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