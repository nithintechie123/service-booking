import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const emptyT = { pincode: '', areaName: '', city: '', state: '' };

export function AdminTerritories() {
  const [territories, setTerritories] = useState([]);
  const [form, setForm] = useState(emptyT);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/territories').then(r => setTerritories(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/territories/${editing}`, form);
      else await api.post('/territories', form);
      toast.success(editing ? 'Updated' : 'Created');
      setForm(emptyT); setEditing(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Territories</h1><p className="text-gray-500">Manage service zones</p></div>
        <button onClick={() => { setForm(emptyT); setEditing(null); setShowForm(true); }} className="btn-primary">+ Add Territory</button>
      </div>
      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">{editing ? 'Edit' : 'New'} Territory</h2>
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            {[['Pincode','pincode'],['Area Name','areaName'],['City','city'],['State','state']].map(([l,k]) => (
              <div key={k}><label className="label">{l}</label><input className="input" required={k!=='state'} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Pincode','Area','City','State','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody>
            {territories.map(t => (
              <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{t.pincode}</td>
                <td className="px-4 py-3">{t.areaName}</td>
                <td className="px-4 py-3">{t.city}</td>
                <td className="px-4 py-3">{t.state}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setForm({ pincode:t.pincode, areaName:t.areaName, city:t.city, state:t.state||'' }); setEditing(t._id); setShowForm(true); }} className="text-brand hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminTerritories;

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/admin/bookings${q}`).then(r => setBookings(r.data.data));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">All Bookings</h1><p className="text-gray-500">Monitor all platform bookings</p></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-40">
          <option value="">All Status</option>
          {['pending','accepted','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b._id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{b.service?.name}</span>
                  <span className={`badge-${b.status}`}>{b.status?.replace('_',' ')}</span>
                </div>
                <p className="text-sm text-gray-500">Customer: {b.customer?.user?.name} · Worker: {b.worker?.user?.name || 'Unassigned'}</p>
                <p className="text-sm text-gray-400">{b.territory?.areaName} · {new Date(b.bookingDate).toLocaleDateString()} {b.bookingTime}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{b.amount}</p>
                <p className="text-xs text-gray-400">{b.duration}h duration</p>
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-center text-gray-400 py-12">No bookings</p>}
      </div>
    </div>
  );
}

export function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [commission, setCommission] = useState(0);

  useEffect(() => { api.get('/admin/payments').then(r => { setPayments(r.data.data); setCommission(r.data.totalCommission); }); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Payments</h1><p className="text-gray-500">Total Commission Earned: <strong className="text-brand">₹{commission?.toFixed(2)}</strong></p></div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Service','Customer','Worker','Amount','Commission','Worker Payout','Status','Date'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{p.booking?.service?.name}</td>
                <td className="px-4 py-3">{p.booking?.customer?.user?.name}</td>
                <td className="px-4 py-3">{p.booking?.worker?.user?.name}</td>
                <td className="px-4 py-3 font-mono">₹{p.amount}</td>
                <td className="px-4 py-3 font-mono text-red-600">₹{p.commission}</td>
                <td className="px-4 py-3 font-mono text-green-600">₹{p.workerPayout}</td>
                <td className="px-4 py-3"><span className={`badge-${p.paymentStatus === 'paid' ? 'completed' : 'pending'}`}>{p.paymentStatus}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const load = () => api.get('/admin/users').then(r => setUsers(r.data.data));
  useEffect(() => { load(); }, []);

  const toggleSuspend = async (id) => {
    await api.put(`/admin/users/${id}/suspend`); toast.success('Updated'); load();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Users</h1><p className="text-gray-500">Manage platform users</p></div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name','Email','Role','Status','Joined','Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3"><span className={u.isActive ? 'badge-approved' : 'badge-rejected'}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleSuspend(u._id)} className={`text-xs font-medium ${u.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
