import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersAPI, projectsAPI, tasksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, StatCard, Avatar, Btn } from '../components/UI';

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('overview');
  const [users, setUsers]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getAll(), projectsAPI.getAll(), tasksAPI.getAll({})])
      .then(([u, p, t]) => { setUsers(u.data.data); setProjects(p.data.data); setTasks(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (id, role) => {
    await usersAPI.update(id, { role });
    setUsers(prev => prev.map(u => u._id===id ? {...u,role} : u));
    toast.success('Role updated');
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    await usersAPI.delete(id);
    setUsers(prev => prev.filter(u => u._id!==id));
    toast.success('User removed');
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete project and all tasks?')) return;
    await projectsAPI.delete(id);
    setProjects(prev => prev.filter(p => p._id!==id));
    toast.success('Project deleted');
  };

  if (loading) return <Spinner />;

  const tabs = ['overview','users','projects'];

  return (
    <div style={{ padding:'28px 32px', fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>Admin Panel</h1>
        <p style={{ color:'#8a99be', fontSize:13 }}>Manage users, projects & system settings</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, background:'#1e2638', padding:3, borderRadius:10, width:'fit-content', marginBottom:24 }}>
        {tabs.map(t => (
          <div key={t} onClick={()=>setTab(t)}
            style={{ padding:'7px 18px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:tab===t?600:400,
              background:tab===t?'#161b27':'transparent', color:tab===t?'#e8edf8':'#8a99be' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      {tab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <StatCard label="Total Users"    value={users.length}   color="#4f8ef7" />
          <StatCard label="Total Projects" value={projects.length} color="#a78bfa" />
          <StatCard label="Total Tasks"    value={tasks.length}   color="#22d3a5" />
          <StatCard label="Admins"         value={users.filter(u=>u.role==='admin').length} color="#f5a623" />
        </div>
      )}

      {tab==='users' && (
        <div style={{ background:'#161b27', border:'1px solid #2a3550', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
            <thead><tr style={{ borderBottom:'1px solid #2a3550' }}>
              {['User','Email','Role','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#5a6a8a', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom:'1px solid #1e2638' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <Avatar user={u} size="sm" />
                      <span style={{ fontWeight:600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'#8a99be' }}>{u.email}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <select value={u.role} onChange={e=>updateRole(u._id,e.target.value)}
                      style={{ background:'#1e2638', border:'1px solid #2a3550', borderRadius:8, padding:'4px 8px', color:'#e8edf8', fontSize:12, fontFamily:'inherit', cursor:'pointer' }}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    {u._id !== user._id && <Btn size="sm" variant="danger" onClick={()=>deleteUser(u._id)}>Remove</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='projects' && (
        <div style={{ background:'#161b27', border:'1px solid #2a3550', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13.5 }}>
            <thead><tr style={{ borderBottom:'1px solid #2a3550' }}>
              {['Project','Owner','Members','Tasks','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:700, color:'#5a6a8a', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} style={{ borderBottom:'1px solid #1e2638' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:p.color||'#4f8ef7' }} />
                      <span style={{ fontWeight:600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', color:'#8a99be' }}>{p.owner?.name||'—'}</td>
                  <td style={{ padding:'12px 16px' }}>{p.members?.length||0}</td>
                  <td style={{ padding:'12px 16px' }}>{tasks.filter(t=>(t.project?._id||t.project)===p._id).length}</td>
                  <td style={{ padding:'12px 16px' }}><Btn size="sm" variant="danger" onClick={()=>deleteProject(p._id)}>Delete</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
