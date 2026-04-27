import { useState, useEffect } from 'react';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default function GestionTareas({ token }) {
  const [tareas, setTareas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [verResueltas, setVerResueltas] = useState(false); 
  const [editandoId, setEditandoId] = useState(null); 
  
  const [formulario, setFormulario] = useState({
    titulo: '', clienteId: '', fechaVencimiento: '', prioridad: 'Media',
    esRecurrente: false, tipoRecurrencia: 'Mensual',
    horaInicio: '09:00', horaFin: '14:00', todoElDia: false 
  });

  useEffect(() => {
    document.title = "InfraDesk: Tareas";
    const cargarDatos = async () => {
      try {
        const resTareas = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resTareas.ok) setTareas(await resTareas.json());

        const resClientes = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resClientes.ok) setClientes(await resClientes.json());
      } catch (error) { console.error("Error al cargar datos", error); }
    };
    if (token) cargarDatos();
  }, [token]);

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    const fechaA = new Date(a.fechaVencimiento).getTime();
    const fechaB = new Date(b.fechaVencimiento).getTime();
    if (fechaA !== fechaB) return fechaA - fechaB;
    const pesos = { 'Urgente': 1, 'Alta': 2, 'Media': 3, 'Baja': 4 };
    return pesos[a.prioridad] - pesos[b.prioridad];
  });

  const tareasMostradas = tareasOrdenadas.filter(t => 
    verResueltas ? t.estado === 'Resuelta' : t.estado !== 'Resuelta'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editandoId ? `/api/tasks/${editandoId}` : '/api/tasks';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formulario)
      });

      if (res.ok) {
        const resTareas = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resTareas.ok) setTareas(await resTareas.json());
        
        alert(editandoId ? '✅ Tarea editada correctamente' : '✅ Nueva tarea asignada');
        cancelarEdicion();
      }
    } catch (error) { console.error("Error al guardar tarea", error); }
  };

  const handleCompletar = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Resuelta' ? 'Pendiente' : 'Resuelta';
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        const resTareas = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resTareas.ok) setTareas(await resTareas.json());
      }
    } catch (error) { console.error("Error al completar", error); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta tarea definitivamente?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setTareas(tareas.filter(t => t._id !== id));
    } catch (error) { console.error("Error al eliminar", error); }
  };

  const iniciarEdicion = (tarea) => {
    setEditandoId(tarea._id);
    const fechaFormateada = new Date(tarea.fechaVencimiento).toISOString().split('T')[0];
    setFormulario({
      titulo: tarea.titulo,
      clienteId: tarea.clienteId?._id || '',
      fechaVencimiento: fechaFormateada,
      prioridad: tarea.prioridad,
      esRecurrente: tarea.esRecurrente || false,
      tipoRecurrencia: tarea.tipoRecurrencia || 'Mensual',
      horaInicio: tarea.horaInicio || '09:00',
      horaFin: tarea.horaFin || '14:00',
      todoElDia: tarea.todoElDia || false
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormulario({ 
      titulo: '', clienteId: '', fechaVencimiento: '', prioridad: 'Media', 
      esRecurrente: false, tipoRecurrencia: 'Mensual',
      horaInicio: '09:00', horaFin: '14:00', todoElDia: false
    });
  };

  const coloresPrioridad = {
    'Baja': '#A0AEC0', 'Media': '#3182CE', 'Alta': '#DD6B20', 'Urgente': '#E53E3E' 
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={tituloStyle}>✅ Gestión de Tareas</h2>
        <button 
          onClick={() => setVerResueltas(!verResueltas)} 
          style={{ background: verResueltas ? '#4A5568' : '#E2E8F0', color: verResueltas ? 'white' : 'black', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {verResueltas ? '🔙 Ver Tareas Pendientes' : '📁 Ver Historial (Completadas)'}
        </button>
      </div>

      {!verResueltas && (
        <div style={{ background: editandoId ? '#EBF8FF' : 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px', border: editandoId ? '2px solid #3182CE' : 'none' }}>
          
          {/* ✅ AJUSTE: He añadido un marginBottom de 20px para separar el título del formulario */}
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4B5563', fontSize: '16px' }}>
            {editandoId ? '✏️ Editando Tarea' : '➕ Asignar Nueva Tarea'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="text" placeholder="¿Qué hay que hacer?" required style={inputStyle} value={formulario.titulo} onChange={e => setFormulario({...formulario, titulo: e.target.value})} />
            
            <select required style={inputStyle} value={formulario.clienteId} onChange={e => setFormulario({...formulario, clienteId: e.target.value})}>
              <option value="">-- Selecciona un Cliente --</option>
              {clientes.map(cli => (
                <option key={cli._id} value={cli._id}>{cli.nombreEmpresa}</option>
              ))}
            </select>

            <input type="date" required style={inputStyle} value={formulario.fechaVencimiento} onChange={e => setFormulario({...formulario, fechaVencimiento: e.target.value})} />
            
            <select style={inputStyle} value={formulario.prioridad} onChange={e => setFormulario({...formulario, prioridad: e.target.value})}>
              <option value="Baja">Prioridad Baja</option>
              <option value="Media">Prioridad Media</option>
              <option value="Alta">Prioridad Alta</option>
              <option value="Urgente">🚨 URGENTE</option>
            </select>

            {/* --- SECCIÓN DE HORARIOS --- */}
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
                    padding: '12px', background: '#F9FAFB', borderRadius: '8px', 
                    border: formulario.todoElDia ? '2px solid #00D1A0' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease'
                }}>
                    <input type="checkbox" id="checkTodoDia" checked={formulario.todoElDia} onChange={e => setFormulario({...formulario, todoElDia: e.target.checked})} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                    <label htmlFor="checkTodoDia" style={{ fontWeight: 'bold', color: '#2D3748', cursor: 'pointer', fontSize: '14px' }}>📅 Todo el día</label>
                </div>
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                    padding: '12px', background: formulario.todoElDia ? '#EDF2F7' : '#F9FAFB', 
                    borderRadius: '8px', border: '1px solid #E2E8F0', opacity: formulario.todoElDia ? 0.6 : 1, transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold' }}>DE:</span>
                        <input type="time" disabled={formulario.todoElDia} style={{ ...inputStyle, padding: '5px 8px', width: 'auto', border: '1px solid #CBD5E0' }} value={formulario.horaInicio} onChange={e => setFormulario({...formulario, horaInicio: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold' }}>A:</span>
                        <input type="time" disabled={formulario.todoElDia} style={{ ...inputStyle, padding: '5px 8px', width: 'auto', border: '1px solid #CBD5E0' }} value={formulario.horaFin} onChange={e => setFormulario({...formulario, horaFin: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE RECURRENCIA --- */}
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
                    padding: '12px', background: '#F9FAFB', borderRadius: '8px', 
                    border: formulario.esRecurrente ? '2px solid #00D1A0' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease'
                }}>
                    <input type="checkbox" id="checkRecurrente" checked={formulario.esRecurrente} onChange={e => setFormulario({...formulario, esRecurrente: e.target.checked})} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                    <label htmlFor="checkRecurrente" style={{ fontWeight: 'bold', color: '#2D3748', cursor: 'pointer', fontSize: '14px' }}>🔄 ¿Tarea Recurrente?</label>
                </div>
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                    padding: '12px', background: !formulario.esRecurrente ? '#EDF2F7' : '#F9FAFB', 
                    borderRadius: '8px', border: '1px solid #E2E8F0', opacity: !formulario.esRecurrente ? 0.6 : 1, transition: 'all 0.2s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold' }}>FRECUENCIA:</span>
                        <select disabled={!formulario.esRecurrente} style={{ ...inputStyle, padding: '8px', flex: 1, border: '1px solid #CBD5E0' }} value={formulario.tipoRecurrencia} onChange={e => setFormulario({...formulario, tipoRecurrencia: e.target.value})}>
                            <option value="Semanal">Cada Semana</option>
                            <option value="Quincenal">Cada Quincena (15 días)</option>
                            <option value="Mensual">Cada Mes</option>
                            <option value="Trimestral">Cada Trimestre (3 meses)</option>
                            <option value="Semestral">Cada Semestre (6 meses)</option>
                            <option value="Anual">Cada Año</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{...botonAccion, flex: 1}}>{editandoId ? '💾 Guardar Cambios' : '+ Crear Tarea'}</button>
              {editandoId && <button type="button" onClick={cancelarEdicion} style={{ padding: '12px', background: '#A0AEC0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>}
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tareasMostradas.length === 0 ? <p style={textoStyle}>{verResueltas ? 'No hay tareas completadas todavía.' : 'No hay tareas pendientes. ¡Buen trabajo!'}</p> : null}
        
        {tareasMostradas.map(tarea => (
          <div key={tarea._id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            background: 'white', padding: '15px', borderRadius: '8px', 
            borderLeft: tarea.estado === 'Resuelta' ? '5px solid #48BB78' : `5px solid ${coloresPrioridad[tarea.prioridad]}`,
            opacity: tarea.estado === 'Resuelta' ? 0.7 : 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ margin: '0 0 5px 0', textDecoration: tarea.estado === 'Resuelta' ? 'line-through' : 'none' }}>{tarea.titulo}</h4>
                <span style={{ fontSize: '11px', background: '#EDF2F7', padding: '2px 6px', borderRadius: '4px', color: '#4A5568', fontWeight: 'bold' }}>
                  {tarea.todoElDia ? '🕒 Todo el día' : `🕒 ${tarea.horaInicio} - ${tarea.horaFin}`}
                </span>
                {tarea.estado !== 'Resuelta' && (
                  <span style={{ fontSize: '12px', background: coloresPrioridad[tarea.prioridad], color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {tarea.prioridad}
                  </span>
                )}
                {tarea.esRecurrente && (
                  <span title={`Se repetirá de forma ${tarea.tipoRecurrencia}`} style={{ fontSize: '12px', background: '#EDF2F7', color: '#4A5568', padding: '2px 6px', borderRadius: '4px', border: '1px solid #CBD5E0' }}>
                    🔄 {tarea.tipoRecurrencia}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                🏢 {tarea.clienteId?.nombreEmpresa || 'Cliente borrado'} | 📅 Límite: {new Date(tarea.fechaVencimiento).toLocaleDateString()}
              </p>
              
              {tarea.estado === 'Resuelta' && tarea.fechaResolucion && (
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#48BB78', fontWeight: 'bold' }}>
                  ✓ Completada el {new Date(tarea.fechaResolucion).toLocaleDateString()} a las {new Date(tarea.fechaResolucion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleCompletar(tarea._id, tarea.estado)} 
                style={{ background: tarea.estado === 'Resuelta' ? '#ECC94B' : '#48BB78', color: tarea.estado === 'Resuelta' ? 'black' : 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {tarea.estado === 'Resuelta' ? '↩️ Reabrir' : '✓ Resolver'}
              </button>
              
              {tarea.estado !== 'Resuelta' && (
                <button onClick={() => iniciarEdicion(tarea)} style={{ background: '#3182CE', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                  ✏️
                </button>
              )}

              <button onClick={() => handleEliminar(tarea._id)} style={{ background: '#E2E8F0', color: '#4A5568', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}