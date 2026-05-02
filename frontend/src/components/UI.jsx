import React, { useState } from 'react';

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: '#161b27', border: '1px solid #3a4a6b', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a3550', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a99be', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid #2a3550', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  todo:        { bg: '#252e44', color: '#8a99be', label: 'To Do' },
  in_progress: { bg: '#1a2d5a', color: '#4f8ef7', label: 'In Progress' },
  done:        { bg: '#0d3328', color: '#22d3a5', label: 'Done' },
  blocked:     { bg: '#3a1010', color: '#f25c5c', label: 'Blocked' },
};
const PRIORITY_STYLES = {
  high:   { bg: '#3a1010', color: '#f25c5c', label: '▲ High' },
  medium: { bg: '#3a2500', color: '#f5a623', label: '— Med'  },
  low:    { bg: '#252e44', color: '#8a99be', label: '▼ Low'  },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.todo;
  return <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>;
}
export function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.low;
  return <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>;
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
export function Btn({ children, variant='ghost', size='', onClick, disabled, style={} }) {
  const base = { display:'inline-flex', alignItems:'center', gap:6, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500, transition:'all .15s', borderRadius:10, ...style };
  const sm = size==='sm' ? { padding:'5px 11px', fontSize:12 } : { padding:'8px 16px', fontSize:13 };
  const variants = {
    primary: { background:'#2563eb', color:'#fff' },
    ghost:   { background:'transparent', color:'#8a99be', border:'1px solid #2a3550' },
    danger:  { background:'#3a1010', color:'#f25c5c', border:'1px solid #3a1010' },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sm, ...variants[variant], opacity: disabled?0.4:1 }}>{children}</button>;
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  const inputStyle = { background:'#1e2638', border:'1px solid #2a3550', borderRadius:10, padding:'9px 13px', color:'#e8edf8', fontSize:13.5, fontFamily:'inherit', width:'100%', outline:'none' };
  if (!label) return <input style={inputStyle} {...props} />;
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#8a99be', marginBottom:5, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>
      {props.type==='textarea'
        ? <textarea style={{ ...inputStyle, resize:'vertical', minHeight:80 }} {...props} />
        : <input style={inputStyle} {...props} />}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#8a99be', marginBottom:5, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>}
      <select style={{ background:'#1e2638', border:'1px solid #2a3550', borderRadius:10, padding:'9px 13px', color:'#e8edf8', fontSize:13.5, fontFamily:'inherit', width:'100%', outline:'none', cursor:'pointer' }} {...props}>{children}</select>
    </div>
  );
}

// ─── Loading / Empty ──────────────────────────────────────────────────────────
export function Spinner() {
  return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div style={{ width:32, height:32, border:'3px solid #2a3550', borderTop:'3px solid #4f8ef7', borderRadius:'50%', animation:'spin 1s linear infinite' }} /></div>;
}
export function Empty({ icon='◻', text, action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'#5a6a8a' }}>
      <div style={{ fontSize:40, marginBottom:12, opacity:.5 }}>{icon}</div>
      <p style={{ fontSize:14, marginBottom:16 }}>{text}</p>
      {action}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background:'#161b27', border:'1px solid #2a3550', borderRadius:16, padding:'18px 20px' }}>
      <div style={{ fontSize:12, color:'#5a6a8a', fontWeight:600, marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color: color||'#e8edf8', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#5a6a8a', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ user, size='' }) {
  if (!user) return null;
  const initials = user.initials || (user.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()) || '?';
  const sz = size==='sm' ? 26 : size==='lg' ? 44 : 34;
  const fs = size==='sm' ? 10 : size==='lg' ? 15 : 13;
  return <div style={{ width:sz, height:sz, borderRadius:'50%', background:(user.color||'#4f8ef7')+'22', color:user.color||'#4f8ef7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:fs, fontWeight:700, flexShrink:0 }}>{initials}</div>;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function ProgressBar({ value, color='#4f8ef7' }) {
  return (
    <div style={{ height:5, background:'#252e44', borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:3, transition:'width .3s' }} />
    </div>
  );
}
