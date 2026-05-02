import React, { useEffect, useState } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { tasksAPI, projectsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Empty, Btn, StatusBadge, PriorityBadge, Modal, Input, Select, Avatar } from '../components/UI';

function TaskFormModal({ task, projects, users, currentUser, onSave, onClose }) {
  const isEdit = !!task;
  const [form, setForm] = useState(task
    ? { name: task.name, description: task.description || '', project: task.project?._id || task.project || '', status: task.status, priority: task.priority, assignee: task.assignee?._id || task.assignee || '', dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' }
    : { name: '', description: '', project: projects[0]?._id || '', status: 'todo', priority: 'medium', assignee: currentUser._id, dueDate: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.project) return toast.error('Name and project required');
    setSaving(true);
    try {
      const res = isEdit ? await tasksAPI.update(task._id, form) : await tasksAPI.create(form);
      onSave(res.data.data);
      toast.success(isEdit ? 'Updated' : 'Task created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit Task' : 'New Task'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save} disabled={saving}>{saving ? '…' : 'Save'}</Btn></>}>
      <Input label="Task Name" value={form.name} onChange={set('name')} placeholder="What needs to be done?" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Select label="Project" value={form.project} onChange={set('project')}>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>
        <Select label="Assignee" value={form.assignee || ''} onChange={set('assignee')}>
          <option value="">Unassigned</option>
          {/* Always include self; show teammates if available */}
          {users.length > 0
            ? users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
            : <option value={currentUser._id}>{currentUser.name} (me)</option>}
        </Select>
        <Select label="Status" value={form.status} onChange={set('status')}>
          <option value="todo">To Do</option><option value="in_progress">In Progress</option>
          <option value="done">Done</option><option value="blocked">Blocked</option>
        </Select>
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </Select>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 5, textTransform: 'uppercase' }}>Due Date</label>
          <input type="date" style={{ background: '#1e2638', border: '1px solid #2a3550', borderRadius: 10, padding: '9px 13px', color: '#e8edf8', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' }}
            value={form.dueDate} onChange={set('dueDate')} />
        </div>
      </div>
    </Modal>
  );
}

export default function MyTasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  // FIX: only populated for admins; members get an empty list and assign to self
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // FIX: don't call usersAPI.getAll() for non-admins — it's a 403
        const calls = [tasksAPI.getMy(), projectsAPI.getAll()];
        if (isAdmin) calls.push(usersAPI.getAll());

        const [t, p, u] = await Promise.all(calls);
        setTasks(t.data.data);
        setProjects(p.data.data);
        if (u) setUsers(u.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSave = t => setTasks(prev => {
    const i = prev.findIndex(x => x._id === t._id);
    if (i >= 0) { const n = [...prev]; n[i] = t; return n; }
    return [...prev, t];
  });

  const toggleDone = async t => {
    const res = await tasksAPI.update(t._id, { status: t.status === 'done' ? 'todo' : 'done' });
    onSave(res.data.data);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Tasks</h1>
          <p style={{ color: '#8a99be', fontSize: 13 }}>{tasks.length} tasks assigned to you</p>
        </div>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ New Task</Btn>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'todo', 'in_progress', 'done'].map(s => (
          <div key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', border: `1px solid ${filter === s ? '#4f8ef7' : '#2a3550'}`, borderRadius: 20, fontSize: 12, cursor: 'pointer', color: filter === s ? '#4f8ef7' : '#8a99be', background: filter === s ? '#1a2d5a' : 'transparent' }}>
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {filtered.length === 0
        ? <Empty icon="✓" text="No tasks here!" action={<Btn variant="primary" onClick={() => setShowModal(true)}>Create a task</Btn>} />
        : filtered.map(t => {
          const project = typeof t.project === 'object' ? t.project : projects.find(p => p._id === t.project);
          const overdue = t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done';
          return (
            <div key={t._id} style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 10, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div onClick={() => toggleDone(t)}
                style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${t.status === 'done' ? '#22d3a5' : '#3a4a6b'}`, background: t.status === 'done' ? '#22d3a5' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: '#000' }}>
                {t.status === 'done' && '✓'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4, textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? '#5a6a8a' : '#e8edf8' }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {project && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#8a99be' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: project.color || '#4f8ef7' }} />{project.name}</span>}
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                  {t.dueDate && <span style={{ fontSize: 11, color: overdue ? '#f25c5c' : '#5a6a8a' }}>📅 {format(parseISO(t.dueDate), 'MMM d')}</span>}
                </div>
              </div>
              <Btn size="sm" variant="ghost" onClick={() => setEditing(t)}>Edit</Btn>
            </div>
          );
        })}

      {(showModal || editing) && (
        <TaskFormModal task={editing} projects={projects} users={users} currentUser={user} onSave={onSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
    </div>
  );
}
