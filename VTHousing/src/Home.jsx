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
          <Link to="/Checklist" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Checklist</Link>
          <Link to="/Prompt" style={{ color: '#861f41', textDecoration: 'none', padding: '0.7em 1.2em', fontSize: '1em' }} onClick={() => setOpen(false)}>Prompt</Link>
        </div>
      )}
    </div>
  );
}
 
import { useState } from 'react';
 
function Home() {
  const [search, setSearch] = useState("");
  const [rent, setRent] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
 
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <DropdownMenu />
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#861f41', fontWeight: 'bold', letterSpacing: '2px' }}>Hokie Homes</h1>
      <input
        type="text"
        placeholder="Search for location, keywords..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '420px',
          fontSize: '1.5rem',
          padding: '1rem',
          borderRadius: '10px',
          border: '2px solid #861f41',
          marginBottom: '2rem',
          outline: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}
      />
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Rent</label>
          <input
            type="number"
            placeholder="Rent"
            value={rent * 100}
            onChange={e => setRent(e.target.value)}
            style={{ width: '120px', fontSize: '1.2rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #861f41', textAlign: 'center' }}
            min="0"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Beds</label>
          <input
            type="number"
            placeholder="Beds"
            value={beds}
            onChange={e => setBeds(e.target.value)}
            style={{ width: '120px', fontSize: '1.2rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #861f41', textAlign: 'center' }}
            min="0"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Baths</label>
          <input
            type="number"
            placeholder="Baths"
            value={baths}
            onChange={e => setBaths(e.target.value)}
            style={{ width: '120px', fontSize: '1.2rem', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #861f41', textAlign: 'center' }}
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
 
export default Home;