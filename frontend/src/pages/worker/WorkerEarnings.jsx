import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function WorkerEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workers/earnings').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500">Your payment history and total earnings</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${data?.earnings?.toLocaleString() || 0}`, color: 'bg-green-50 text-green-800' },
          { label: 'Total Jobs',     value: data?.totalJobs || 0,                          color: 'bg-blue-50 text-blue-800' },
          { label: 'Rating',         value: `⭐ ${data?.rating || 0}`,                    color: 'bg-yellow-50 text-yellow-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
        {data?.payments?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No payment records yet</p>
        ) : (
          <div className="space-y-3">
            {data?.payments?.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{p.booking?.service?.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()} · Commission: ₹{p.commission}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">₹{p.workerPayout}</p>
                  <span className={`text-xs ${p.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {p.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
