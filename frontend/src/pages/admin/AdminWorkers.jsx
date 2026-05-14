import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    const q = filter !== 'all' ? `?status=${filter}` : '';
    Promise.all([api.get(`/admin/workers${q}`), api.get('/territories')])
      .then(([w, t]) => { setWorkers(w.data.data); setTerritories(t.data.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/workers/${id}/status`, { status });
      toast.success(`Worker ${status}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const assignTerritory = async (id, territoryId) => {
    try {
      await api.put(`/admin/workers/${id}/territory`, { territoryId });
      toast.success('Territory assigned');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-500">Manage worker approvals and territories</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-40">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-4">
          {workers.map(w => (
            <div key={w._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{w.user?.name}</p>
                    <span className={`badge-${w.status}`}>{w.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{w.user?.email} · {w.user?.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Skills: {w.skills?.join(', ') || 'N/A'} · Territory: {w.territory?.areaName || 'Unassigned'}
                  </p>
                  <p className="text-sm text-gray-400">⭐ {w.rating} · {w.totalJobs} jobs · ₹{w.earnings?.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <select className="input text-sm"
                    value={w.territory?._id || ''}
                    onChange={e => assignTerritory(w._id, e.target.value)}>
                    <option value="">Assign territory</option>
                    {territories.map(t => (
                      <option key={t._id} value={t._id}>{t.areaName} ({t.pincode})</option>
                    ))}
                  </select>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(w._id, 'approved')} className="btn-primary flex-1 py-1.5 text-sm">Approve</button>
                      <button onClick={() => updateStatus(w._id, 'rejected')} className="btn-danger flex-1 py-1.5 text-sm">Reject</button>
                    </div>
                  )}
                  {w.documentPath && (
                    <a href={`http://localhost:5000/${w.documentPath}`} target="_blank" rel="noreferrer"
                      className="text-xs text-brand hover:underline text-center">View Document</a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {workers.length === 0 && <p className="text-center text-gray-400 py-12">No workers found</p>}
        </div>
      )}
    </div>
  );
}
