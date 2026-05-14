import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data.data)).finally(() => setLoading(false));
  }, []);

  const active = bookings.filter(b => ['pending','accepted','in_progress'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand to-brand-dark rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="mt-1 text-blue-100">Book trusted service professionals near you</p>
        <Link to="/customer/book" className="inline-block mt-4 bg-white text-brand font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
          + Book a Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Bookings',    value: active.length,    color: 'bg-blue-50 text-blue-800' },
          { label: 'Completed',          value: completed,         color: 'bg-green-50 text-green-800' },
          { label: 'Total Bookings',     value: bookings.length,  color: 'bg-purple-50 text-purple-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active Bookings */}
      {active.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Active Bookings</h2>
          <div className="space-y-3">
            {active.map(b => (
              <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{b.service?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(b.bookingDate).toLocaleDateString()} at {b.bookingTime}
                    {b.worker && ` · Worker: ${b.worker?.user?.name}`}
                  </p>
                </div>
                <span className={`badge-${b.status}`}>{b.status.replace('_',' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick service grid */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Popular Services</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { name: 'Electrician', emoji: '⚡' },
            { name: 'Plumber',     emoji: '🔧' },
            { name: 'AC Repair',   emoji: '❄️' },
            { name: 'Cleaning',    emoji: '🧹' },
            { name: 'Carpenter',   emoji: '🪚' },
            { name: 'Painter',     emoji: '🖌️' },
          ].map(s => (
            <Link key={s.name} to="/customer/book"
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-brand-light hover:text-brand transition-colors text-center">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-medium mt-1 text-gray-700">{s.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
