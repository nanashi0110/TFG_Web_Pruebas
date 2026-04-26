import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };

export default function VistaCalendario({ token }) {
  const [eventos, setEventos] = useState([]);
  
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState('month');
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  useEffect(() => {
    document.title = "InfraDesk: Calendario";
    
    const cargarTareas = async () => {
      try {
        const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const tareasDb = await res.json();
          
          const tareasTransformadas = tareasDb.map(tarea => {
            const fechaInicio = new Date(tarea.fechaVencimiento);
            fechaInicio.setHours(9, 0, 0, 0); 
            
            const fechaFin = new Date(tarea.fechaVencimiento);
            fechaFin.setHours(14, 0, 0, 0); 
            
            return {
              id: tarea._id,
              title: tarea.titulo, 
              cliente: tarea.clienteId?.nombreEmpresa || 'Sin cliente',
              start: fechaInicio,
              end: fechaFin, 
              estado: tarea.estado,
              prioridad: tarea.prioridad
            };
          });
          
          setEventos(tareasTransformadas);
        }
      } catch (error) {
        console.error("Error al cargar tareas para el calendario", error);
      }
    };
    if (token) cargarTareas();
  }, [token]);

  const eventStyleGetter = (evento) => {
    let backgroundColor = '#3182CE'; 
    if (evento.estado === 'Resuelta') backgroundColor = '#48BB78'; 
    else if (evento.prioridad === 'Urgente') backgroundColor = '#E53E3E'; 
    else if (evento.prioridad === 'Alta') backgroundColor = '#DD6B20'; 
    else if (evento.prioridad === 'Baja') backgroundColor = '#A0AEC0'; 

    return {
      style: { backgroundColor, borderRadius: '4px', opacity: evento.estado === 'Resuelta' ? 0.7 : 1, color: 'white', border: 'none', display: 'block', fontSize: '12px', padding: '2px 5px' }
    };
  };

  const abrirModalDia = (fechaClica) => {
    setDiaSeleccionado(fechaClica);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDiaSeleccionado(null);
  };

  const tareasDelDia = diaSeleccionado 
    ? eventos.filter(e => new Date(e.start).toDateString() === new Date(diaSeleccionado).toDateString())
    : [];

  return (
    <div style={{ height: '85vh', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
      <h2 style={{ ...tituloStyle, marginTop: 0 }}>📅 Calendario de Actuaciones</h2>
      
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        culture="es"
        
        date={fechaActual}
        onNavigate={(nuevaFecha) => setFechaActual(nuevaFecha)}
        view={vistaActual}
        onView={(nuevaVista) => setVistaActual(nuevaVista)}
        
        views={['month', 'week', 'day', 'agenda']}
        
        selectable={true}
        onSelectSlot={(slotInfo) => abrirModalDia(slotInfo.start)} 
        onSelectEvent={(evento) => abrirModalDia(evento.start)} 
        
        onDrillDown={(fecha) => abrirModalDia(fecha)}
        
        messages={{
          next: "Siguiente ❯",
          previous: "❮ Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          noEventsInRange: "No hay mantenimientos ni averías en este periodo.",
          showMore: (total) => `+${total} más`
        }}
        eventPropGetter={eventStyleGetter}
        style={{ height: 'calc(100% - 60px)' }}
      />

      {modalAbierto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={cerrarModal}>
          
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '500px',
            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#1A202C' }}>
                📆 Tareas del {diaSeleccionado.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={cerrarModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖️</button>
            </div>

            {tareasDelDia.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '20px 0' }}>Día libre. No hay actuaciones programadas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tareasDelDia.map(tarea => (
                  <div key={tarea.id} style={{ 
                    padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    borderLeft: tarea.estado === 'Resuelta' ? '5px solid #48BB78' : '5px solid #3182CE',
                    background: tarea.estado === 'Resuelta' ? '#F0FFF4' : '#F7FAFC'
                  }}>
                    <h4 style={{ margin: '0 0 5px 0', textDecoration: tarea.estado === 'Resuelta' ? 'line-through' : 'none' }}>
                      {tarea.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#4A5568' }}>🏢 Cliente: <strong>{tarea.cliente}</strong></p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{tarea.estado}</span>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>Prioridad: {tarea.prioridad}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}