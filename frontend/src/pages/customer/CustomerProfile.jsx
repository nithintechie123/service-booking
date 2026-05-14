import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customers/profile').then(r => {
      setProfile(r.data.data);
      const c = r.data.data;
      setForm({
        name: c.user?.name || '',
        phone: c.user?.phone || '',
        address: c.address || '',
        pincode: c.pincode || '',
        city: c.city || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/customers/profile', form);
      setProfile(data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your account details</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-secondary">
          {editing ? 'Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{profile?.user?.name?.[0]}</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">{profile?.user?.name}</p>
          <p className="text-gray-500 text-sm">{profile?.user?.email}</p>
        </div>
      </div>

      <div className="card">
        {!editing ? (
          <div className="space-y-3 text-sm">
            {[
              ['Full Name', profile?.user?.name],
              ['Email',     profile?.user?.email],
              ['Phone',     profile?.user?.phone || '—'],
              ['Address',   profile?.address || '—'],
              ['Pincode',   profile?.pincode || '—'],
              ['City',      profile?.city || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
}
