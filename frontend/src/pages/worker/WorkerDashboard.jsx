import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function WorkerDashboard() {
  const { profile, setProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get('/bookings/worker')
      .then(r => setBookings(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await api.put('/workers/availability');
      setProfile(prev => ({ ...prev, availability: data.data.availability }));
      toast.success(`You are now ${data.data.availability}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setToggling(false); }
  };

  const pending = bookings.filter(b => b.status === 'pending').length;
  const inProgress = bookings.filter(b => b.status === 'in_progress').length;
  const completed = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
          <p className="text-gray-500">
            Territory: <strong>{profile?.territory?.areaName || 'Not assigned'}</strong>
            {profile?.territory && ` (${profile.territory.pincode})`}
          </p>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={toggling || profile?.availability === 'busy'}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            profile?.availability === 'available'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {toggling ? '...' : profile?.availability === 'available' ? '✅ Available' : profile?.availability === 'busy' ? '⚙️ On Job' : '⏸ Unavailable'}
        </button>
      </div>

      {profile?.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          ⏳ Your account is pending admin approval. You'll start receiving bookings once approved.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending',     value: pending,            color: 'bg-yellow-50 text-yellow-700' },
          { label: 'In Progress', value: inProgress,         color: 'bg-blue-50 text-blue-700' },
          { label: 'Completed',   value: completed,          color: 'bg-green-50 text-green-700' },
          { label: 'Rating',      value: `⭐ ${profile?.rating || 0}`, color: 'bg-purple-50 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        {loading ? <p className="text-gray-400">Loading...</p> : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{b.service?.name}</p>
                  <p className="text-xs text-gray-500">{b.customer?.user?.name} · {new Date(b.bookingDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge-${b.status}`}>{b.status?.replace('_', ' ')}</span>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-gray-400 text-sm">No bookings yet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
