import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, DoorOpen, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  User, Phone, Mail, Calendar, MessageSquare, AlertCircle,
} from 'lucide-react';
import { houses, rooms, reservations } from '../../services/localDB';
import Logo from '../../components/Logo';

export default function ReservePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [propertyList, setPropertyList] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    moveInDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const all = houses.list();
    setPropertyList(all);
    if (all.length === 1) {
      setSelectedHouse(all[0]);
      setRoomList(rooms.list(all[0].id));
      setStep(2);
    }
  }, []);

  const chooseHouse = (h) => {
    setSelectedHouse(h);
    setRoomList(rooms.list(h.id));
    setStep(2);
  };

  const chooseRoom = (r) => {
    const vacant = r.bedCapacity - r.occupants;
    if (vacant <= 0) {
      setError('This room is full. Please pick another.');
      return;
    }
    setError('');
    setSelectedRoom(r);
    setStep(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) return setError('Please enter your full name.');
    if (!form.phone.trim()) return setError('Please enter your phone number.');

    setSubmitting(true);
    try {
      const res = reservations.create({
        houseId: selectedHouse.id,
        roomId: selectedRoom.id,
        ...form,
      });
      navigate(`/reserve/success/${res.reference}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] bg-noise">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo size={40} showWordmark />
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            Admin Login <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <DoorOpen size={12} /> Reserve a Bed
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Book your boarding house
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">
            No account needed. Pick a room, fill in your details, and we'll confirm your reservation.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= n
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {step > n ? <CheckCircle2 size={14} strokeWidth={3} /> : n}
              </div>
              {n < 3 && (
                <div className={`w-8 h-0.5 rounded-full ${step > n ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 max-w-xl mx-auto flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Step 1 — Choose property (only if multi-property) */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card">
                <h2 className="font-bold text-slate-900 mb-1">Step 1 — Choose a property</h2>
                <p className="text-xs text-slate-500 mb-4">Pick the boarding house you want to reserve a bed in.</p>
                <div className="space-y-2">
                  {propertyList.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => chooseHouse(h)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-indigo-400 bg-white text-left transition"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Building2 size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{h.name}</p>
                        {h.address && <p className="text-xs text-slate-500">{h.address}</p>}
                      </div>
                      <ArrowRight size={16} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Choose room */}
          {step === 2 && selectedHouse && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button
                onClick={() => { setStep(1); setSelectedHouse(null); setRoomList([]); }}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="card">
                <h2 className="font-bold text-slate-900 mb-1">Step 2 — Pick a room</h2>
                <p className="text-xs text-slate-500 mb-4">
                  {selectedHouse.name} · {roomList.length} room{roomList.length !== 1 ? 's' : ''}
                </p>
                {roomList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">No rooms available.</p>
                ) : (
                  <div className="space-y-2">
                    {roomList.map((r) => {
                      const vacant = r.bedCapacity - r.occupants;
                      const full = vacant <= 0;
                      return (
                        <button
                          key={r.id}
                          onClick={() => !full && chooseRoom(r)}
                          disabled={full}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                            full
                              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 hover:border-indigo-400 bg-white'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${full ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                            <DoorOpen size={18} className={full ? 'text-rose-500' : 'text-emerald-600'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">Room {r.roomNumber}</p>
                            <p className="text-xs text-slate-500">
                              ₱{Number(r.monthlyRate).toLocaleString('en-PH')}/mo · {vacant} bed{vacant !== 1 ? 's' : ''} left
                            </p>
                          </div>
                          {!full && <ArrowRight size={16} className="text-slate-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3 — Details form */}
          {step === 3 && selectedRoom && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button
                onClick={() => { setStep(2); setSelectedRoom(null); }}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="card mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <DoorOpen size={16} className="text-indigo-600" />
                  <p className="text-xs font-bold text-slate-600 uppercase">Your selection</p>
                </div>
                <p className="font-bold text-slate-900">
                  {selectedHouse.name} — Room {selectedRoom.roomNumber}
                </p>
                <p className="text-sm text-slate-500">
                  ₱{Number(selectedRoom.monthlyRate).toLocaleString('en-PH')}/month
                </p>
              </div>

              <form onSubmit={handleSubmit} className="card space-y-4">
                <h2 className="font-bold text-slate-900">Step 3 — Your details</h2>

                <div>
                  <label className="label">Full Name *</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      className="input pl-10"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Juan Dela Cruz"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Phone Number *</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      className="input pl-10"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. 09171234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email (optional)</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="email"
                      className="input pl-10"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Preferred Move-in Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="date"
                      className="input pl-10"
                      value={form.moveInDate}
                      onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <textarea
                      className="input pl-10"
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="e.g. I prefer a bed near the window"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin" size={16} /> Submitting…</>
                  ) : (
                    <>Submit Reservation <ArrowRight size={16} /></>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  No payment required. The admin will review your request and contact you.
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}