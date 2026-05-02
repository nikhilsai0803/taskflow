import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isPast, parseISO } from 'date-fns';
import { projectsAPI, tasksAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Empty, Btn, StatusBadge, PriorityBadge, Modal, Input, Select, Avatar } from '../components/UI';

function TaskModal({ task, project, users, currentUser, onSave, onClose }) {
  const isEdit = !!task;
  const [form, setForm] = useState(task || { name: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Task name required');
    setSaving(true);
    try {
      const payload = { ...form, project: project._id };
      const res = isEdit ? await tasksAPI.update(task._id, payload) : await tasksAPI.create(payload);
      onSave(res.data.data);
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit Task' : 'New Task'} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Task'}</Btn></>}>
      <Input label="Task Name" value={form.name} onChange={set('name')} placeholder="What needs to be done?" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 5, textTransform: 'uppercase' }}>Description</label>
        <textarea style={{ background: '#1e2638', border: '1px solid #2a3550', borderRadius: 10, padding: '9px 13px', color: '#e8edf8', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }}
          value={form.description} onChange={set('description')} placeholder="Details…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Select label="Status" value={form.status} onChange={set('status')}>
          <option value="todo">To Do</option><option value="in_progress">In Progress</option>
          <option value="done">Done</option><option value="blocked">Blocked</option>
        </Select>
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </Select>
        <Select label="Assignee" value={form.assignee || ''} onChange={set('assignee')}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </Select>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8a99be', marginBottom: 5, textTransform: 'uppercase' }}>Due Date</label>
          <input type="date" style={{ background: '#1e2638', border: '1px solid #2a3550', borderRadius: 10, padding: '9px 13px', color: '#e8edf8', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' }}
            value={form.dueDate ? form.dueDate.slice(0, 10) : ''} onChange={set('dueDate')} />
        </div>
      </div>
    </Modal>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  // FIX: use project members as the assignee list for non-admins
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showTask, setShowTask] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // FIX: fetch all users only for admins; members use the project's own member list
        const calls = [projectsAPI.getOne(id), tasksAPI.getAll({ project: id })];
        if (isAdmin) calls.push(usersAPI.getAll());

        const [p, t, u] = await Promise.all(calls);
        const projectData = p.data.data;
        setProject(projectData);
        setTasks(t.data.data);

        if (u) {
          setUsers(u.data.data);
        } else {
          // For non-admins, use the populated members array from the project
          setUsers(projectData.members?.filter(m => typeof m === 'object') || []);
        }
      } catch {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSave = t => setTasks(prev => {
    const i = prev.findIndex(x => x._id === t._id);
    if (i >= 0) { const n = [...prev]; n[i] = t; return n; }
    return [...prev, t];
  });

  const toggleDone = async (t) => {
    const newStatus = t.status === 'done' ? 'todo' : 'done';
    const res = await tasksAPI.update(t._id, { status: newStatus });
    onSave(res.data.data);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete task?')) return;
    await tasksAPI.delete(taskId);
    setTasks(prev => prev.filter(t => t._id !== taskId));
    toast.success('Task deleted');
  };

  if (loading) return <Spinner />;
  if (!project) return null;

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const isOwner = project.owner?._id === user._id || project.owner === user._id;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button onClick={() => navigate('/projects')}
              style={{ background: 'transparent', border: '1px solid #2a3550', borderRadius: 8, color: '#8a99be', cursor: 'pointer', fontSize: 12, padding: '4px 10px' }}>← Back</button>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: project.color }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{project.name}</h1>
          </div>
          <p style={{ color: '#8a99be', fontSize: 13 }}>{project.description}</p>
        </div>
        <Btn variant="primary" onClick={() => setShowTask(true)}>+ Add Task</Btn>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'todo', 'in_progress', 'done', 'blocked'].map(s => (
          <div key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', border: `1px solid ${filter === s ? '#4f8ef7' : '#2a3550'}`, borderRadius: 20, fontSize: 12, cursor: 'pointer',
              color: filter === s ? '#4f8ef7' : '#8a99be', background: filter === s ? '#1a2d5a' : 'transparent' }}>
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {filtered.length === 0
        ? <Empty icon="◻" text="No tasks found" action={<Btn variant="primary" onClick={() => setShowTask(true)}>Add first task</Btn>} />
        : filtered.map(t => {
          const assignee = typeof t.assignee === 'object' ? t.assignee : users.find(u => u._id === t.assignee);
          const overdue = t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'done';
          return (
            <div key={t._id} style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 10, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div onClick={() => toggleDone(t)}
                style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${t.status === 'done' ? '#22d3a5' : '#3a4a6b'}`, background: t.status === 'done' ? '#22d3a5' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, color: '#000' }}>
                {t.status === 'done' && '✓'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4, textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? '#5a6a8a' : '#e8edf8' }}>{t.name}</div>
                {t.description && <div style={{ fontSize: 12, color: '#5a6a8a', marginBottom: 4 }}>{t.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <StatusBadge status={t.status} />
                  <PriorityBadge priority={t.priority} />
                  {t.dueDate && <span style={{ fontSize: 11, color: overdue ? '#f25c5c' : '#5a6a8a' }}>📅 {format(parseISO(t.dueDate), 'MMM d')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {assignee && <Avatar user={assignee} size="sm" />}
                <Btn size="sm" variant="ghost" onClick={() => setEditing(t)}>Edit</Btn>
                {(isAdmin || isOwner || t.createdBy?._id === user._id || t.createdBy === user._id) &&
                  <Btn size="sm" variant="danger" onClick={() => deleteTask(t._id)}>Del</Btn>}
              </div>
            </div>
          );
        })}

      {(showTask || editing) && (
        <TaskModal task={editing} project={project} users={users} currentUser={user} onSave={onSave} onClose={() => { setShowTask(false); setEditing(null); }} />
      )}
    </div>
  );
}
