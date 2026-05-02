import React, { useEffect, useState } from 'react';
import { usersAPI, tasksAPI, projectsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Avatar } from '../components/UI';

export function TeamPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers]   = useState([]);
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          // Admins can see all users and all tasks
          const [u, t] = await Promise.all([usersAPI.getAll(), tasksAPI.getAll({})]);
          setUsers(u.data.data);
          setTasks(t.data.data);
        } else {
          // FIX: Non-admins can't call GET /users. Instead, pull their projects
          // and collect the populated member objects from each project.
          const [p, t] = await Promise.all([projectsAPI.getAll(), tasksAPI.getAll({})]);
          const memberMap = {};
          p.data.data.forEach(proj => {
            (proj.members || []).forEach(m => {
              if (m && typeof m === 'object' && m._id) memberMap[m._id] = m;
            });
            const owner = proj.owner;
            if (owner && typeof owner === 'object' && owner._id) memberMap[owner._id] = owner;
          });
          setUsers(Object.values(memberMap));
          setTasks(t.data.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Team</h1>
        <p style={{ color: '#8a99be', fontSize: 13 }}>
          {users.length} {isAdmin ? 'members' : 'teammates across your projects'}
        </p>
      </div>
      <div style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a3550' }}>
              {['Member', 'Role', 'Active Tasks', 'Completed'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#5a6a8a', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const ut = tasks.filter(t => (t.assignee?._id || t.assignee) === u._id);
              return (
                <tr key={u._id} style={{ borderBottom: '1px solid #1e2638' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={u} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                          {u.name} {u._id === user._id && <span style={{ fontSize: 10, color: '#4f8ef7', marginLeft: 4 }}>(you)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#5a6a8a' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: u.role === 'admin' ? '#2d1f5a' : '#252e44', color: u.role === 'admin' ? '#a78bfa' : '#8a99be', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{ut.filter(t => t.status !== 'done').length}</td>
                  <td style={{ padding: '14px 16px', color: '#22d3a5', fontWeight: 600 }}>{ut.filter(t => t.status === 'done').length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamPage;
