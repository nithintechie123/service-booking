import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/worker',           label: 'Dashboard', icon: '📊', end: true },
  { to: '/worker/bookings',  label: 'Bookings',  icon: '📋' },
  { to: '/worker/earnings',  label: 'Earnings',  icon: '💰' },
  { to: '/worker/profile',   label: 'Profile',   icon: '👤' },
];

export default function WorkerLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-sm">W</span></div>
            <div><p className="font-semibold text-sm text-gray-900">{user?.name}</p><p className="text-xs text-gray-400">Worker</p></div>
          </div>
          {profile && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {profile.availability}
              </span>
              <span className="text-xs text-gray-400">{profile.status}</span>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }>
              <span>{icon}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full">
            <span>🚪</span>Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><div className="max-w-5xl mx-auto p-6"><Outlet /></div></main>
    </div>
  );
}
