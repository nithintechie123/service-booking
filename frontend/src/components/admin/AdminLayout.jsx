import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',             label: 'Dashboard',   icon: '📊', end: true },
  { to: '/admin/workers',     label: 'Workers',      icon: '👷' },
  { to: '/admin/bookings',    label: 'Bookings',     icon: '📋' },
  { to: '/admin/services',    label: 'Services',     icon: '🔧' },
  { to: '/admin/territories', label: 'Territories',  icon: '📍' },
  { to: '/admin/payments',    label: 'Payments',     icon: '💰' },
  { to: '/admin/users',       label: 'Users',        icon: '👥' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} transition-all bg-white border-r border-gray-100 flex flex-col`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          {!collapsed && <span className="font-bold text-gray-900">ServiceBook</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-400 hover:text-gray-600 text-lg">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-brand-light text-brand font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }>
              <span>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {!collapsed && <p className="text-xs text-gray-500 truncate mb-2">{user?.name}</p>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 w-full">
            <span>🚪</span>{!collapsed && 'Logout'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
