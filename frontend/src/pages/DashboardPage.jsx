import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI } from '../utils/api';
import { StatCard, StatusBadge, PriorityBadge, Spinner, ProgressBar, Avatar } from '../components/UI';
import { format, isPast, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks]  = useState([]);
  const [overdue, setOverdue]  = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      tasksAPI.getDashStats(),
      projectsAPI.getAll(),
      tasksAPI.getMy(),
      tasksAPI.getAll({ overdue: true }),
    ]).then(([s, p, my, ov]) => {
      setStats(s.data.data);
      setProjects(p.data.data);
      setMyTasks(my.data.data.filter(t => t.status !== 'done').slice(0, 6));
      setOverdue(ov.data.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: '#8a99be', fontSize: 13 }}>Good day, {user?.name?.split(' ')[0]}! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Tasks"  value={stats?.total    || 0} color="#4f8ef7" sub={`${stats?.projects || 0} projects`} />
        <StatCard label="Completed"    value={stats?.done     || 0} color="#22d3a5" sub={stats?.total ? `${Math.round((stats.done/stats.total)*100)}% done` : '0% done'} />
        <StatCard label="In Progress"  value={stats?.inProgress||0} color="#f5a623" sub={`${stats?.myOpen||0} mine`} />
        <StatCard label="Overdue"      value={stats?.overdue  || 0} color="#f25c5c" sub="needs attention" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* My Tasks */}
        <div style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>My Open Tasks</h3>
            <Link to="/tasks" style={{ fontSize: 12, color: '#4f8ef7', textDecoration: 'none' }}>View all →</Link>
          </div>
          {myTasks.length === 0
            ? <p style={{ color: '#5a6a8a', fontSize: 13 }}>No open tasks — great work!</p>
            : myTasks.map(t => (
              <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2638' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <StatusBadge status={t.status} />
                    {t.dueDate && <span style={{ fontSize: 11, color: isPast(parseISO(t.dueDate)) ? '#f25c5c' : '#5a6a8a' }}>📅 {format(parseISO(t.dueDate), 'MMM d')}</span>}
                  </div>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))}
        </div>

        {/* Projects */}
        <div style={{ background: '#161b27', border: '1px solid #2a3550', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Projects Progress</h3>
            <Link to="/projects" style={{ fontSize: 12, color: '#4f8ef7', textDecoration: 'none' }}>All →</Link>
          </div>
          {projects.slice(0, 5).map(p => {
            const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
            return (
              <div key={p._id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || '#4f8ef7' }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#8a99be' }}>{p.doneCount}/{p.taskCount}</span>
                </div>
                <ProgressBar value={pct} color={p.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div style={{ background: '#161b27', border: '1px solid #3a1010', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f25c5c', marginBottom: 12 }}>⚠ Overdue Tasks</h3>
          {overdue.map(t => (
            <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2638' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#8a99be', marginTop: 2 }}>{t.project?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {t.assignee && <Avatar user={t.assignee} size="sm" />}
                <span style={{ fontSize: 11, color: '#f25c5c' }}>Due {t.dueDate ? format(parseISO(t.dueDate), 'MMM d') : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
