import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import RegisterCustomer from './pages/RegisterCustomer';
import RegisterWorker from './pages/RegisterWorker';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminTerritories from './pages/admin/AdminTerritories';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';

// Worker pages
import WorkerLayout from './components/worker/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerBookings from './pages/worker/WorkerBookings';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerEarnings from './pages/worker/WorkerEarnings';

// Customer pages
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerNewBooking from './pages/customer/CustomerNewBooking';
import CustomerProfile from './pages/customer/CustomerProfile';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'worker') return <Navigate to="/worker" />;
  return <Navigate to="/customer" />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/worker" element={<RegisterWorker />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="workers" element={<AdminWorkers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="territories" element={<AdminTerritories />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Worker */}
        <Route path="/worker" element={<ProtectedRoute roles={['worker']}><WorkerLayout /></ProtectedRoute>}>
          <Route index element={<WorkerDashboard />} />
          <Route path="bookings" element={<WorkerBookings />} />
          <Route path="profile" element={<WorkerProfile />} />
          <Route path="earnings" element={<WorkerEarnings />} />
        </Route>

        {/* Customer */}
        <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerLayout /></ProtectedRoute>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="book" element={<CustomerNewBooking />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
