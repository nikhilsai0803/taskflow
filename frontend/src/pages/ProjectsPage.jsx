import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { projectsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Empty, Btn, ProgressBar, Modal, Input, Select, Avatar } from '../components/UI';

const COLORS = ['#4f8ef7','#22d3a5','#f5a623','#a78bfa','#f25c5c','#38bdf8','#fb7185'];

function ProjectFormModal({ project, users, currentUser, onSave, onClose }) {
  const isEdit = !!project;
  const [form, setForm] = useState(project
    ? { name: project.name, description: project.description || '', color: project.color || '#4f8ef7', members: project.members.map(m => m._id || m) }
    : { name: '', description: '', color: '#4f8ef7', members: [currentUser._id] });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleMember = id => setForm(f => ({
    ...f, members: f.members.includes(id) ? f.members.filter(x => x !== id) : [...f.members, id]
  }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      const res = isEdit ? await projectsAPI.update(project._id, form) : await projectsAPI.create(form);
      onSave(res.data.data);
      toast.success(isEdit ? 'Project updated' : 'Project created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit Project' : 'New Project'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Project'}</Btn></>}>
      <Input label="Project Name" value={form.name} onChange={set('name')} placeholder="e.g. Website Redesign" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 5, textTransform: 'uppercase' }}>Description</label>
        <textarea style={{ background: '#1e2638', border: '1px solid #2a3550', borderRadius: 10, padding: '9px 13px', color: '#e8edf8', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }}
          value={form.description} onChange={set('description')} placeholder="What is this project about?" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 8, textTransform: 'uppercase' }}>Color</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {COLORS.map(c => <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
            style={{ width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', boxSizing: 'border-box' }} />)}
        </div>
      </div>
      {users.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 8, textTransform: 'uppercase' }}>Team Members</label>
          {users.map(u => (
            <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' }}>
              <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ accentColor: '#4f8ef7' }} />
              <Avatar user={u} size="sm" />
              <span style={{ fontSize: 13 }}>{u.name}</span>
              <span style={{ fontSize: 10, background: '#252e44', color: '#8a99be', padding: '2px 6px', borderRadius: 10 }}>{u.role}</span>
            </label>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  // users list is only available to admins; members use an empty list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      // FIX: only fetch all users if the current user is an admin.
      // Non-admins hit a 403 on GET /users, causing the runtime error.
      const calls = [projectsAPI.getAll()];
      if (isAdmin) calls.push(usersAPI.getAll());

      const [p, u] = await Promise.all(calls);
      setProjects(p.data.data);
      if (u) setUsers(u.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSave = (p) => setProjects(prev => {
    const i = prev.findIndex(x => x._id === p._id);
    if (i >= 0) { const n = [...prev]; n[i] = p; return n; }
    return [...prev, p];
  });

  const del = async (id) => {
    if (!window.confirm('Delete project and all its tasks?')) return;
    await projectsAPI.delete(id);
    setProjects(p => p.filter(x => x._id !== id));
    toast.success('Project deleted');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: '#8a99be', fontSize: 13 }}>{projects.length} projects</p>
        </div>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ New Project</Btn>
      </div>

      {projects.length === 0
        ? <Empty icon="◫" text="No projects yet" action={<Btn variant="primary" onClick={() => setShowModal(true)}>Create first project</Btn>} />
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
            {projects.map(p => {
              const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
              return (
                <div key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                  style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3a4a6b'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a3550'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, marginTop: 4 }} />
                    {(isAdmin || p.owner?._id === user._id || p.owner === user._id) && (
                      <button onClick={e => { e.stopPropagation(); setEditing(p); }}
                        style={{ background: 'transparent', border: '1px solid #2a3550', borderRadius: 8, color: '#8a99be', cursor: 'pointer', fontSize: 11, padding: '4px 10px' }}>Edit</button>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: '#8a99be', marginBottom: 16, lineHeight: 1.5 }}>{p.description || 'No description'}</p>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#5a6a8a' }}>Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={p.color} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(p.members || []).slice(0, 4).map(m => <Avatar key={m._id || m} user={typeof m === 'object' ? m : null} size="sm" />)}
                    </div>
                    <span style={{ fontSize: 12, color: '#8a99be' }}>{p.taskCount || 0} tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
      }

      {(showModal || editing) && (
        <ProjectFormModal
          project={editing}
          // For non-admins, fall back to the members of the project being edited
          users={isAdmin ? users : (editing?.members?.filter(m => typeof m === 'object') || [])}
          currentUser={user}
          onSave={onSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
