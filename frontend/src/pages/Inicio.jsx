import { useEffect } from 'react';

// Si usas estos estilos a menudo, podemos sacarlos luego a un archivo CSS o un archivo config.js, 
// pero por ahora los pegamos aquí para que no se rompa nada.
const tituloStyle = { color: '#111827', marginBottom: '10px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' };
const textoStyle = { color: '#4B5563', fontSize: '16px' };

export default function Inicio() {
  useEffect(() => {
    document.title = "InfraDesk: Dashboard";
  }, []);

  return (
    <div>
      <h1 style={tituloStyle}>🏠 Dashboard</h1>
      <p style={textoStyle}>Bienvenido de vuelta, aquí está el resumen del día</p>
    </div>
  );
}