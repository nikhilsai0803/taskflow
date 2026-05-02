import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Avatar({ user, size = '' }) {
  if (!user) return null;
  const initials = user.initials || user.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const sz = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const fs = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
  return (
    <div style={{ width: sz, height: sz, borderRadius: '50%', background: (user.color || '#4f8ef7') + '22',
      color: user.color || '#4f8ef7', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fs, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export { Avatar };

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/',         label: 'Dashboard', end: true },
    { to: '/projects', label: 'Projects'  },
    { to: '/tasks',    label: 'My Tasks'  },
    { to: '/team',     label: 'Team'      },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117', color: '#e8edf8', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: '#161b27', borderRight: '1px solid #2a3550', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 18px 20px', fontSize: 18, fontWeight: 700, color: '#4f8ef7', borderBottom: '1px solid #2a3550', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⬡</span> TaskFlow
        </div>

        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', padding: '9px 18px', color: isActive ? '#4f8ef7' : '#8a99be',
              textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              background: isActive ? '#1e2638' : 'transparent', borderLeft: `3px solid ${isActive ? '#4f8ef7' : 'transparent'}`,
              transition: 'all .15s'
            })}>
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: '#5a6a8a', padding: '16px 18px 4px', textTransform: 'uppercase' }}>Admin</div>
            <NavLink to="/admin"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', padding: '9px 18px', color: isActive ? '#4f8ef7' : '#8a99be',
                textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                background: isActive ? '#1e2638' : 'transparent', borderLeft: `3px solid ${isActive ? '#4f8ef7' : 'transparent'}`,
              })}>
              Admin Panel
            </NavLink>
          </>
        )}

        <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid #2a3550' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar user={user} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#5a6a8a', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', padding: '7px', background: 'transparent', border: '1px solid #2a3550', borderRadius: 8, color: '#8a99be', cursor: 'pointer', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
