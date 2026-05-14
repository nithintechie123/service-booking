import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workers/profile').then(r => {
      setWorker(r.data.data);
      const w = r.data.data;
      setForm({
        name: w.user?.name || '',
        phone: w.user?.phone || '',
        skills: w.skills?.join(', ') || '',
        bio: w.bio || '',
        experience: w.experience || '',
        hourlyRate: w.hourlyRate || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/workers/profile', form);
      setWorker(data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your worker profile</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-secondary">
          {editing ? 'Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rating',     value: `⭐ ${worker?.rating}` },
          { label: 'Total Jobs', value: worker?.totalJobs },
          { label: 'Earnings',   value: `₹${worker?.earnings?.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {!editing ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{worker?.user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Email</span>
              <span>{worker?.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Phone</span>
              <span>{worker?.user?.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Territory</span>
              <span>{worker?.territory?.areaName} ({worker?.territory?.pincode})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Experience</span>
              <span>{worker?.experience} years</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Hourly Rate</span>
              <span>₹{worker?.hourlyRate}/hr</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Skills</span>
              <span>{worker?.skills?.join(', ')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Bio</span>
              <span className="text-right max-w-xs">{worker?.bio || '—'}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            {[
              ['Name', 'name', 'text'],
              ['Phone', 'phone', 'text'],
              ['Experience (years)', 'experience', 'number'],
              ['Hourly Rate (₹)', 'hourlyRate', 'number'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="label">Skills (comma-separated)</label>
              <input className="input" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        )}
      </div>
    </div>
  );
}
