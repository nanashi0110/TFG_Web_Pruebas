import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '15px', width: '100%', outline: 'none' };
const botonAccion = { padding: '12px', background: '#00D1A0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,209,160,0.3)' };

export default function NuevoCliente({ token }) {
  useEffect(() => {
    document.title = "InfraDesk: Nuevo Cliente";
  }, []);

  const [cliente, setCliente] = useState({ nombreEmpresa: '', personaContacto: '', telefono: '', email: '' });
  const navegar = useNavigate();

  const handleChange = (e) => setCliente({ ...cliente, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('/api/customers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cliente),
      });

      if (respuesta.ok) {
        alert('✅ Cliente guardado con éxito');
        navegar('/clientes'); 
      } else {
        alert('Error al guardar: No tienes permisos o la sesión caducó');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2 style={tituloStyle}>🏢 Alta de Nuevo Cliente</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', gap: '15px', marginTop: '20px' }}>
        <input type="text" name="nombreEmpresa" placeholder="Nombre de Empresa" onChange={handleChange} required style={inputStyle} />
        <input type="text" name="personaContacto" placeholder="Persona de Contacto" onChange={handleChange} style={inputStyle} />
        <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={inputStyle} />
        <button type="submit" style={botonAccion}>Guardar Cliente</button>
      </form>
    </div>
  );
}