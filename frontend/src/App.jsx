import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// --- IMPORTAMOS LAS PANTALLAS ---
import Login from './Login';
import Registro from './Registro';
import Inicio from './pages/Inicio';
import GestionTareas from './pages/GestionTareas';
import VistaCalendario from './pages/VistaCalendario';
import NuevoCliente from './pages/NuevoCliente';
import ListaClientes from './pages/ListaClientes';
import FichaCliente from './pages/FichaCliente';

const linkStyle = { color: '#E5E7EB', textDecoration: 'none', fontWeight: '500', fontSize: '16px', display: 'block', padding: '12px', borderRadius: '6px', transition: 'background 0.2s' };

export default function App() {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [menuAbierto, setMenuAbierto] = useState(window.innerWidth > 768);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

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

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div style={{ display: 'flex',  width: '100vw', height: '100dvh', fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative' }}>
          
          {/* LAYOUT: SIDEBAR (MENÚ LATERAL) */}
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
            overflowX: 'hidden', 
            whiteSpace: 'nowrap'
          }}>
            
            <div style={{ padding: '20px', background: '#1A202C', display: 'flex', justifyContent: menuAbierto ? 'space-between' : 'center', alignItems: 'center', flexShrink: 0 }}>
              {menuAbierto && <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Dashboard</span>}
              <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                {menuAbierto ? '◀' : '▶'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '15px', gap: '10px', marginTop: '10px', alignItems: menuAbierto ? 'stretch' : 'center', flex: 1, overflowY: 'auto' }}>
              <Link to="/" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '🏠 Inicio' : '🏠'}</Link>
              <Link to="/clientes" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '📋 Clientes' : '📋'}</Link>
              <Link to="/tareas" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '✅ Tareas' : '✅'}</Link>
              <Link to="/calendario" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '📅 Calendario' : '📅'}</Link>
              <Link to="/nuevo-cliente" onClick={cerrarSiEsMovil} style={linkStyle}>{menuAbierto ? '➕ Nuevo Cliente' : '➕'}</Link>
              
              <div style={{ height: '1px', background: '#2D3748', margin: '10px 0', flexShrink: 0 }}></div>
              <Link to="/registro" onClick={cerrarSiEsMovil} style={{...linkStyle, color: '#E5E7EB'}}>
                {menuAbierto ? '👥 Añadir Usuario' : '👥'}
              </Link>
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #2D3748', flexShrink: 0 }}>
              <button onClick={handleCerrarSesion} style={{ width: '100%', padding: '10px', background: '#E53E3E', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center' }}>
                {menuAbierto ? 'Cerrar Sesión' : '🚪'}
              </button>
            </div>
          </div>

          {/* LAYOUT: ZONA DE CONTENIDO CENTRAL */}
          <div style={{ flex: 1, padding: esMovil ? '20px' : '50px', background: '#F3F4F6', overflowY: 'auto', width: '100%' }}>
            {esMovil && !menuAbierto && (
              <button onClick={() => setMenuAbierto(true)} style={{ padding: '10px 15px', marginBottom: '20px', background: '#0D1117', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' }}>
                ☰ Menú
              </button>
            )}

            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/clientes" element={<ListaClientes token={token} />} />
              <Route path="/tareas" element={<GestionTareas token={token} />} />
              <Route path="/calendario" element={<VistaCalendario token={token} />} />
              <Route path="/nuevo-cliente" element={<NuevoCliente token={token} />} />
              <Route path="/registro" element={<Registro token={token} />} /> 
              <Route path="/ficha/:id" element={<FichaCliente token={token} />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {esMovil && menuAbierto && (
            <div onClick={() => setMenuAbierto(false)} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh', background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />
          )}

        </div>
      )}
    </BrowserRouter>
  );
}