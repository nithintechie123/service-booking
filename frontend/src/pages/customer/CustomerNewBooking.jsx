import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['Service', 'Location', 'Schedule', 'Confirm'];

export default function CustomerNewBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [territory, setTerritory] = useState(null);
  const [detectingTerritory, setDetectingTerritory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    serviceId: '',
    pincode: '',
    address: '',
    bookingDate: '',
    bookingTime: '',
    duration: 1,
    notes: '',
  });

  const selectedService = services.find(s => s._id === form.serviceId);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.data));
  }, []);

  const detectTerritory = async () => {
    if (!form.pincode || form.pincode.length < 5) return;
    setDetectingTerritory(true);
    try {
      const { data } = await api.get(`/territories/detect/${form.pincode}`);
      setTerritory(data.data);
      toast.success(`Service available in ${data.data.areaName}!`);
    } catch {
      setTerritory(null);
      toast.error('No service available for this pincode');
    } finally { setDetectingTerritory(false); }
  };

  const canNext = () => {
    if (step === 0) return !!form.serviceId;
    if (step === 1) return !!territory && !!form.address;
    if (step === 2) return !!form.bookingDate && !!form.bookingTime && form.duration >= 1;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/bookings', form);
      toast.success('Booking created successfully!');
      navigate('/customer/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const estimatedAmount = selectedService ? selectedService.basePrice * form.duration : 0;

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>
        <p className="text-gray-500">Find trusted professionals near you</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-brand text-white' : i === step ? 'bg-brand text-white ring-4 ring-brand/20' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === step ? 'text-brand' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 transition-colors ${i < step ? 'bg-brand' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card min-h-[280px]">
        {/* Step 0: Choose Service */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Choose a Service</h2>
            <div className="grid grid-cols-2 gap-3">
              {services.map(s => (
                <button
                  key={s._id}
                  onClick={() => setForm({ ...form, serviceId: s._id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.serviceId === s._id
                      ? 'border-brand bg-brand-light'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                  <p className="text-sm font-bold text-brand mt-2">₹{s.basePrice}/hr</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Your Location</h2>
            <div>
              <label className="label">Pincode</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Enter your pincode"
                  value={form.pincode}
                  onChange={e => { setForm({ ...form, pincode: e.target.value }); setTerritory(null); }}
                  maxLength={6}
                />
                <button
                  onClick={detectTerritory}
                  disabled={detectingTerritory || form.pincode.length < 5}
                  className="btn-primary whitespace-nowrap px-4"
                >
                  {detectingTerritory ? '...' : 'Check'}
                </button>
              </div>
              {territory && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  ✅ Service available in <strong>{territory.areaName}, {territory.city}</strong>
                </div>
              )}
            </div>
            <div>
              <label className="label">Full Address</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="House/Flat No., Street, Landmark..."
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Schedule Your Booking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  min={today}
                  value={form.bookingDate}
                  onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Time</label>
                <select className="input" value={form.bookingTime} onChange={e => setForm({ ...form, bookingTime: e.target.value })}>
                  <option value="">Select time</option>
                  {['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Duration (hours)</label>
                <select className="input" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <div className="p-3 bg-brand-light rounded-xl w-full text-center">
                  <p className="text-xs text-gray-500">Estimated Cost</p>
                  <p className="text-xl font-bold text-brand">₹{estimatedAmount}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Special Notes (optional)</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Any specific requirements..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Confirm Booking</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              {[
                ['Service',   selectedService?.name],
                ['Location',  `${form.address}, ${form.pincode}`],
                ['Territory', `${territory?.areaName}, ${territory?.city}`],
                ['Date',      form.bookingDate],
                ['Time',      form.bookingTime],
                ['Duration',  `${form.duration} hour${form.duration > 1 ? 's' : ''}`],
                ['Amount',    `₹${estimatedAmount}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
              {form.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Notes</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">{form.notes}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              A worker from your area will be automatically assigned. You'll be notified once they accept.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="btn-primary disabled:opacity-40"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary px-8"
          >
            {submitting ? 'Booking...' : '✅ Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
