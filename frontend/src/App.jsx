import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

// ==========================================
// 📄 PANTALLAS (El contenido de la derecha)
// ==========================================

function Inicio() {
  return (
    <div>
      <h1 style={tituloStyle}>🏠 Dashboard</h1>
      <p style={textoStyle}>Bienvenido de vuelta, aquí está el resumen del día</p>
    </div>
  );
}

function NuevoCliente() {
  const [cliente, setCliente] = useState({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' });
  const navegar = useNavigate();

  const handleChange = (e) => setCliente({ ...cliente, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });

      if (respuesta.ok) {
        alert('✅ Cliente guardado con éxito');
        navegar('/clientes'); 
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2 style={tituloStyle}>🏢 Alta de Nuevo Cliente</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '400px', gap: '15px', marginTop: '20px' }}>
        <input type="text" name="nombreEmpresa" placeholder="Nombre de Empresa" onChange={handleChange} required style={inputStyle} />
        <input type="text" name="personaContacto" placeholder="Persona de Contacto" onChange={handleChange} style={inputStyle} />
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={inputStyle} />
        <button type="submit" style={botonAccion}>Guardar Cliente</button>
      </form>
    </div>
  );
}

function ListaClientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const obtenerClientes = async () => {
      const respuesta = await fetch('/api/customers');
      const datos = await respuesta.json();
      setClientes(datos);
    };
    obtenerClientes();
  }, []);

  return (
    <div>
      <h2 style={tituloStyle}>📋 Base de Datos de Clientes</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
        {clientes.length === 0 ? <p style={textoStyle}>Cargando o no hay clientes...</p> : null}
        {clientes.map((cli) => (
          <div key={cli._id} style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '10px', width: '300px', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '18px' }}>{cli.nombreEmpresa}</h3>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#4B5563' }}>👤 {cli.personaContacto}</p>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#4B5563' }}>📞 {cli.telefono}</p>
            <p style={{ margin: '8px 0', fontSize: '15px', color: '#4B5563' }}>✉️ {cli.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🔀 LAYOUT PRINCIPAL (Sidebar + Contenido)
// ==========================================
function App() {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [menuAbierto, setMenuAbierto] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      const movil = window.innerWidth <= 768;
      setEsMovil(movil);
      if (movil) setMenuAbierto(false); 
      else setMenuAbierto(true); 
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cerrarSiEsMovil = () => {
    if (esMovil) setMenuAbierto(false);
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative' }}>
        
        {/* === SIDEBAR (Izquierda) === */}
        <div style={{ 
          width: menuAbierto ? '260px' : (esMovil ? '0px' : '70px'), 
          background: '#0D1117', 
          color: 'white',
          transition: 'width 0.3s ease', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 100, 
          position: esMovil ? 'absolute' : 'relative', 
          height: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap' // ✅ TRUCO: Evita que el texto se aplaste en la animación
        }}>
          {/* Cabecera del Sidebar */}
          {/* ✅ CORRECCIÓN: Hemos quitado el minWidth: '260px' de aquí */}
          <div style={{ padding: '20px', background: '#1A202C', display: 'flex', justifyContent: menuAbierto ? 'space-between' : 'center', alignItems: 'center' }}>
            {menuAbierto && <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Dashboard</span>}
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)} 
              style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              title={menuAbierto ? "Contraer" : "Expandir"}
            >
              {menuAbierto ? '◀' : '▶'}
            </button>
          </div>

          {/* Enlaces */}
          {/* ✅ CORRECCIÓN: También hemos quitado el minWidth de aquí y centramos los iconos al cerrar */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '15px', gap: '10px', marginTop: '10px', alignItems: menuAbierto ? 'stretch' : 'center' }}>
            <Link to="/" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '🏠 Inicio' : '🏠'}</Link>
            <Link to="/clientes" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '📋 Clientes' : '📋'}</Link>
            <Link to="/nuevo-cliente" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '➕ Nuevo Cliente' : '➕'}</Link>
          </div>
        </div>

        {/* === ZONA DE CONTENIDO (Derecha) === */}
        <div style={{ flex: 1, padding: esMovil ? '20px' : '50px', background: '#F3F4F6', overflowY: 'auto', width: '100%' }}>
          {esMovil && !menuAbierto && (
            <button 
              onClick={() => setMenuAbierto(true)}
              style={{ padding: '10px 15px', marginBottom: '20px', background: '#0D1117', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' }}
            >
              ☰ Menú
            </button>
          )}

          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/clientes" element={<ListaClientes />} />
            <Route path="/nuevo-cliente" element={<NuevoCliente />} />
          </Routes>
        </div>

        {/* === OVERLAY (Capa oscura) === */}
        {esMovil && menuAbierto && (
          <div 
            onClick={() => setMenuAbierto(false)} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          />
        )}

      </div>
    </BrowserRouter>
  );
}

// --- Estilos Globales para Componentes ---
const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const linkStyle = { color: '#E5E7EB', textDecoration: 'none', fontWeight: '500', fontSize: '16px', display: 'block', padding: '12px', borderRadius: '6px', transition: 'background 0.2s' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default App;