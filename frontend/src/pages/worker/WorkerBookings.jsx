import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  accepted: { next: 'in_progress', label: 'Start Job', color: 'btn-primary' },
  in_progress: { next: 'completed', label: 'Mark Complete', color: 'bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors' },
};

export default function WorkerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/bookings/worker').then(r => setBookings(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const respond = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/respond`, { action });
      toast.success(action === 'accept' ? 'Booking accepted!' : 'Booking rejected');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500">Jobs assigned to your territory</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-40">
          <option value="all">All</option>
          {['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b._id} className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{b.service?.name}</h3>
                    <span className={`badge-${b.status}`}>{b.status?.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                    <p>👤 {b.customer?.user?.name}</p>
                    <p>📞 {b.customer?.user?.phone}</p>
                    <p>📅 {new Date(b.bookingDate).toLocaleDateString()}</p>
                    <p>🕐 {b.bookingTime}</p>
                    <p>⏱ {b.duration}h duration</p>
                    <p>💰 ₹{b.amount}</p>
                    <p className="col-span-2">📍 {b.address}</p>
                    {b.notes && <p className="col-span-2 text-gray-400">📝 {b.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[160px]">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => respond(b._id, 'accept')} className="btn-primary text-sm py-2">✅ Accept</button>
                      <button onClick={() => respond(b._id, 'reject')} className="btn-danger text-sm py-2">❌ Reject</button>
                    </>
                  )}
                  {STATUS_FLOW[b.status] && (
                    <button
                      onClick={() => updateStatus(b._id, STATUS_FLOW[b.status].next)}
                      className={`${STATUS_FLOW[b.status].color} text-sm py-2`}
                    >
                      {STATUS_FLOW[b.status].label}
                    </button>
                  )}
                  {b.status === 'completed' && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-green-700 text-sm font-medium">✅ Completed</p>
                      <p className="text-green-600 text-xs">Payout: ₹{(b.amount * 0.9).toFixed(0)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No bookings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
