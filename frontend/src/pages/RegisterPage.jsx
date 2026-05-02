import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = { background:'#1e2638', border:'1px solid #2a3550', borderRadius:10, padding:'11px 14px', color:'#e8edf8', fontSize:14, fontFamily:'inherit', width:'100%', outline:'none', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#8a99be', marginBottom:5, textTransform:'uppercase', letterSpacing:'.05em' };

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:"'DM Sans', sans-serif" }}>
      <div style={{ background:'#161b27', border:'1px solid #2a3550', borderRadius:20, padding:40, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>⬡</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#e8edf8' }}>Create Account</h2>
          <p style={{ fontSize:13, color:'#8a99be', marginTop:4 }}>Join your team on TaskFlow</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}><label style={lbl}>Full Name</label><input style={inp} value={form.name} onChange={set('name')} placeholder="Alex Chen" required /></div>
          <div style={{ marginBottom:14 }}><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="you@company.co" required /></div>
          <div style={{ marginBottom:14 }}><label style={lbl}>Password</label><input style={inp} type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required /></div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Role</label>
            <select style={inp} value={form.role} onChange={set('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:loading?0.7:1 }}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#8a99be' }}>
          Have an account? <Link to="/login" style={{ color:'#4f8ef7' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
