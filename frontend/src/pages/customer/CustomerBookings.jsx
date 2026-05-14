import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/reviews', { bookingId: booking._id, rating, comment });
      toast.success('Review submitted!');
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="font-bold text-lg text-gray-900 mb-1">Rate Your Experience</h3>
        <p className="text-sm text-gray-500 mb-4">{booking.service?.name} · {booking.worker?.user?.name}</p>

        {/* Star Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500 self-center">{rating}/5</span>
        </div>

        <div className="mb-4">
          <label className="label">Comment (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewed, setReviewed] = useState(new Set());

  const load = () => {
    api.get('/bookings/my').then(r => setBookings(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`, { reason: 'Customer cancelled' });
      toast.success('Booking cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColors = {
    pending: 'border-l-yellow-400',
    accepted: 'border-l-blue-400',
    in_progress: 'border-l-purple-400',
    completed: 'border-l-green-400',
    cancelled: 'border-l-red-300',
    rejected: 'border-l-red-300',
  };

  return (
    <div className="space-y-6">
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={() => setReviewed(prev => new Set([...prev, reviewBooking._id]))}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500">Track all your service bookings</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-40">
          <option value="all">All</option>
          {['pending','accepted','in_progress','completed','cancelled'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading...</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b._id} className={`card border-l-4 ${statusColors[b.status] || 'border-l-gray-200'}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{b.service?.name}</h3>
                    <span className={`badge-${b.status}`}>{b.status?.replace('_',' ')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <p>📅 {new Date(b.bookingDate).toLocaleDateString()}</p>
                    <p>🕐 {b.bookingTime}</p>
                    <p>⏱ {b.duration}h</p>
                    <p>💰 ₹{b.amount}</p>
                    {b.worker && <p>👷 {b.worker?.user?.name}</p>}
                    {b.worker && <p>📞 {b.worker?.user?.phone}</p>}
                    <p className="col-span-2">📍 {b.address}</p>
                    <p className="col-span-2 text-gray-400">📌 {b.territory?.areaName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:min-w-[150px]">
                  {b.status === 'pending' && (
                    <button onClick={() => cancel(b._id)} className="btn-danger text-sm py-1.5">Cancel</button>
                  )}
                  {b.status === 'completed' && !reviewed.has(b._id) && (
                    <button onClick={() => setReviewBooking(b)} className="btn-primary text-sm py-1.5">
                      ⭐ Leave Review
                    </button>
                  )}
                  {(b.status === 'completed' && reviewed.has(b._id)) && (
                    <p className="text-xs text-green-600 text-center">✅ Reviewed</p>
                  )}
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Booked on</p>
                    <p className="text-xs font-medium text-gray-700">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-3">📋</p>
              <p className="font-medium">No bookings found</p>
              <p className="text-sm mt-1">Book a service to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
