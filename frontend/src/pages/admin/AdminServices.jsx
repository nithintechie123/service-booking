import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', basePrice: '', category: '', icon: 'wrench' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/services').then(r => setServices(r.data.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/services/${editing}`, form);
      else await api.post('/services', form);
      toast.success(editing ? 'Service updated' : 'Service created');
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    await api.delete(`/services/${id}`); toast.success('Service deactivated'); load();
  };

  const startEdit = (s) => { setForm({ name: s.name, description: s.description, basePrice: s.basePrice, category: s.category, icon: s.icon }); setEditing(s._id); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500">Manage service categories</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true); }} className="btn-primary">+ Add Service</button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Service' : 'New Service'}</h2>
          <form onSubmit={save} className="grid grid-cols-2 gap-4">
            <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className="label">Base Price (₹/hr)</label><input className="input" type="number" required value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} /></div>
            <div><label className="label">Icon</label><input className="input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => (
          <div key={s._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.category}</p>
                <p className="text-sm text-gray-400 mt-1">{s.description}</p>
                <p className="font-bold text-brand mt-2">₹{s.basePrice}/hr</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(s)} className="p-1.5 text-gray-400 hover:text-brand">✏️</button>
                <button onClick={() => del(s._id)} className="p-1.5 text-gray-400 hover:text-red-500">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
