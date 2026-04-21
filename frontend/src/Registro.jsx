import { useState } from 'react';

// Fíjate que ahora recibimos el token como propiedad (props)
function Registro({ token }) {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    try {
      const respuesta = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- Aquí mandamos la "pulsera"
        },
        body: JSON.stringify({ nombre, usuario, password })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ texto: '✅ Administrador creado con éxito', tipo: 'exito' });
        // Limpiamos los campos para poder crear otro si se quiere
        setNombre('');
        setUsuario('');
        setPassword('');
      } else {
        setMensaje({ texto: datos.mensaje, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error al conectar con el servidor', tipo: 'error' });
    }
  };

  return (
    <div>
      <h2 style={{ color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>
        👥 Crear Nuevo Administrador
      </h2>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', marginTop: '20px' }}>
        
        {mensaje.texto && (
          <div style={{ background: mensaje.tipo === 'error' ? '#FEE2E2' : '#D1FAE5', color: mensaje.tipo === 'error' ? '#DC2626' : '#059669', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre de Usuario:</label>
            <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ background: '#0D1117', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            Registrar Usuario
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registro;