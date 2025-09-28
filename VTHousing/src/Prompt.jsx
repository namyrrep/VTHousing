import { useState } from 'react';
import { Link } from 'react-router-dom';
 
function DropdownMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
      <button
        style={{
          background: '#861f41', color: '#fff', border: 'none', padding: '0.7em 1.2em', borderRadius: 6,
          fontSize: '1.1em', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>
      {open && (
        <div style={{
          marginTop: 8, background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          minWidth: 140, display: 'flex', flexDirection: 'column', padding: '0.5em 0'
        }}>
          <Link to="/" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Home</Link>
          <Link to="/Checklist" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Checklist</Link>
        </div>
      )}
    </div>
  );
}
 
function Prompt() {
  return (
    <div>
      <DropdownMenu />
      <h2>About Page</h2>
      <p>Learn more about Hokie Rentals and our mission.</p>
    </div>
  );
}
 
export default Prompt;