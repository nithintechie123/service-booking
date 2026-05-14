import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;

  const bookingMap = {};
  stats?.bookingStats?.forEach(b => { bookingMap[b._id] = b.count; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={stats?.totalUsers}     icon="👥" color="bg-blue-50" />
        <StatCard label="Active Workers"  value={stats?.totalWorkers}   icon="👷" color="bg-green-50" />
        <StatCard label="Total Bookings"  value={stats?.totalBookings}  icon="📋" color="bg-purple-50" />
        <StatCard label="Platform Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="bg-yellow-50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Booking Status Breakdown</h2>
          <div className="space-y-3">
            {['pending','accepted','in_progress','completed','cancelled'].map(s => (
              <div key={s} className="flex items-center justify-between">
                <span className="capitalize text-sm text-gray-600">{s.replace('_',' ')}</span>
                <span className={`badge-${s}`}>{bookingMap[s] || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pending Workers', count: stats?.pendingWorkers, href: '/admin/workers?status=pending', color: 'text-yellow-600 bg-yellow-50' },
              { label: 'Total Customers', count: stats?.totalCustomers, href: '/admin/users', color: 'text-blue-600 bg-blue-50' },
            ].map(a => (
              <a key={a.label} href={a.href} className={`p-4 rounded-xl ${a.color} hover:opacity-90 transition`}>
                <p className="text-2xl font-bold">{a.count ?? '—'}</p>
                <p className="text-sm font-medium mt-1">{a.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
