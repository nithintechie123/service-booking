import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterWorker() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', skills:'', bio:'', experience:'', hourlyRate:'', territoryId:'' });
  const [document, setDocument] = useState(null);
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get('/territories').then(r => setTerritories(r.data.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (document) fd.append('document', document);
    setLoading(true);
    try {
      await api.post('/auth/register/worker', fd);
      toast.success('Registration submitted! Await admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Join as a Service Worker</h1>
          <p className="text-gray-500 mt-1">Start receiving jobs in your territory</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your name" required {...f('name')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" required {...f('email')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="9876543210" required {...f('phone')} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" required {...f('password')} />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input className="input" type="number" min="0" placeholder="2" {...f('experience')} />
              </div>
              <div>
                <label className="label">Hourly Rate (₹)</label>
                <input className="input" type="number" placeholder="150" {...f('hourlyRate')} />
              </div>
              <div>
                <label className="label">Preferred Territory</label>
                <select className="input" {...f('territoryId')}>
                  <option value="">Select area</option>
                  {territories.map(t => (
                    <option key={t._id} value={t._id}>{t.areaName}, {t.city} ({t.pincode})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Skills (comma-separated)</label>
                <input className="input" placeholder="Electrician, Wiring, AC Repair" required {...f('skills')} />
              </div>
              <div className="col-span-2">
                <label className="label">Bio</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief about yourself..." {...f('bio')} />
              </div>
              <div className="col-span-2">
                <label className="label">ID Proof / Certificate (PDF/Image)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input py-1.5"
                  onChange={e => setDocument(e.target.files[0])} />
                <p className="text-xs text-gray-400 mt-1">Max 5MB. Required for approval.</p>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
