import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none' };

export default function ListaClientes({ token }) {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  useEffect(() => {
    document.title = "InfraDesk: Clientes";
  }, []);

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await fetch('/api/customers', {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (respuesta.ok) {
          const datos = await respuesta.json();
          const clientesOrdenados = datos.sort((a, b) => 
            a.nombreEmpresa.localeCompare(b.nombreEmpresa)
          );
          setClientes(clientesOrdenados);
        } else {
          console.error("No autorizado para ver clientes");
        }
      } catch (error) {
        console.error("Error de conexión");
      }
    };
    
    if (token) obtenerClientes();
  }, [token]);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`⚠️ ¿Estás seguro de que quieres eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const respuesta = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (respuesta.ok) {
        setClientes(clientes.filter(cliente => cliente._id !== id));
      } else {
        alert("Error al eliminar el cliente");
      }
    } catch (error) {
      console.error("Error de conexión al eliminar", error);
    }
  };

  const clientesFiltrados = clientes.filter((cli) => 
    cli.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase()) || 
    (cli.personaContacto && cli.personaContacto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div>
      <h2 style={tituloStyle}>📋 Base de Datos de Clientes</h2>
      
      <div style={{ marginTop: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar por empresa o contacto..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px', border: '2px solid #00D1A0' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {clientes.length === 0 ? <p style={textoStyle}>Cargando o no hay clientes...</p> : null}
        
        {clientes.length > 0 && clientesFiltrados.length === 0 ? (
          <p style={{ color: '#E53E3E', fontWeight: 'bold' }}>No se ha encontrado ningún cliente con ese nombre.</p>
        ) : null}
        
        {clientesFiltrados.map((cli) => (
          <div key={cli._id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            border: '1px solid #E5E7EB', 
            padding: '15px 20px', 
            borderRadius: '8px', 
            background: 'white', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', minWidth: '220px' }}>{cli.nombreEmpresa}</h3>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '150px' }}>👤 {cli.personaContacto}</span>
              <span style={{ fontSize: '15px', color: '#4B5563', minWidth: '120px' }}>📞 {cli.telefono}</span>
              <span style={{ fontSize: '15px', color: '#4B5563' }}>✉️ {cli.email}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <Link 
                to={`/ficha/${cli._id}`}
                style={{ background: '#00D1A0', color: 'white', textDecoration: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Abrir ficha completa"
              >
                ✏️
              </Link>
              
              <button 
                onClick={() => handleEliminar(cli._id, cli.nombreEmpresa)}
                style={{ background: '#4B5563', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Eliminar cliente"
              >
                🗑️
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}