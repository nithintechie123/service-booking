import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterCustomer() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'', pincode:'', city:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register/customer', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Customer Account</h1>
          <p className="text-gray-500 mt-1">Book home services near you</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input className="input" placeholder="John Doe" required {...f('name')} />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" required {...f('email')} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 6 chars" required {...f('password')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="9876543210" required {...f('phone')} />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" placeholder="Street address" {...f('address')} />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" placeholder="500001" required {...f('pincode')} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Hyderabad" required {...f('city')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
