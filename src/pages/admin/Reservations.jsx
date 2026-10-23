import { useState, useEffect } from 'react';
import {
  Search, CheckCircle2, XCircle, Loader2, User, Phone, Mail,
  Calendar, Clock, AlertTriangle, Home,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { reservations, houses } from '../../services/localDB';

export default function Reservations() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [review, setReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (current) setItems(reservations.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openReview = (r) => {
    setReview(r);
    setShowRejectInput(false);
    setRejectReason('');
    setTempPassword('Tenant123!');
  };

  const handleApprove = () => {
    if (!tempPassword || tempPassword.length < 6) {
      return toast('Password must be at least 6 characters', 'error');
    }
    setActionLoading(true);
    try {
      reservations.approve(review.id, tempPassword);
      toast(`Reservation approved — tenant account created`, 'success');
      setReview(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return toast('Please provide a reason', 'error');
    setActionLoading(true);
    try {
      reservations.reject(review.id, rejectReason.trim());
      toast('Reservation rejected', 'success');
      setReview(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = items.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.toLowerCase().includes(search.toLowerCase()) ||
      r.reference.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = items.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
          Reservations
          {pendingCount > 0 && (
            <span className="chip bg-amber-100 text-amber-700 border-amber-200">{pendingCount} pending</span>
          )}
        </h1>
        <p className="text-slate-600 text-sm mt-1">Process online requests from guests</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, or reference…"
            className="input pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`chip whitespace-nowrap capitalize ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-bold mb-1">No reservations</p>
          <p className="text-sm text-slate-500">
            {filterStatus === 'pending' ? 'All caught up!' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <motion.button
              key={r.id}
              onClick={() => openReview(r)}
              whileHover={{ y: -2 }}
              className={`w-full text-left card !p-4 transition ${
                r.status === 'pending' ? 'ring-2 ring-amber-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow shrink-0">
                  {r.fullName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{r.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{r.reference}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="chip-violet">
                      <Home size={11} /> Room {r.roomNumber}
                    </span>
                    <span className="chip-slate">
                      <Phone size={11} /> {r.phone}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Review modal */}
      <Modal
        isOpen={!!review}
        onClose={() => setReview(null)}
        title={review?.status === 'pending' ? 'Review Reservation' : 'Reservation Details'}
        size="lg"
      >
        {review && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Reference</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">{review.reference}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="chip-violet"><Home size={11} /> Room {review.roomNumber}</span>
                <StatusBadge status={review.status} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <Row icon={User} label="Name" value={review.fullName} />
              <Row icon={Phone} label="Phone" value={review.phone} />
              {review.email && <Row icon={Mail} label="Email" value={review.email} />}
              <Row icon={Calendar} label="Move-in" value={review.moveInDate} />
              <Row
                icon={Clock}
                label="Submitted"
                value={new Date(review.createdAt).toLocaleString()}
              />
            </div>

            {review.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes from guest</p>
                <p className="text-sm text-slate-700">{review.notes}</p>
              </div>
            )}

            {review.status === 'pending' && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Approving will create a tenant account with the password you set below. The guest will be assigned to Room {review.roomNumber}.
                  </p>
                </div>

                <div>
                  <label className="label">Temporary Password for Guest</label>
                  <input
                    className="input font-mono"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Tenant123!"
                  />
                  <p className="text-xs text-slate-500 mt-1">They'll use this to log in and pay rent.</p>
                </div>

                {showRejectInput && (
                  <div>
                    <label className="label">Reason for Rejection</label>
                    <textarea
                      className="input"
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Room is already reserved"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  {!showRejectInput ? (
                    <>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="btn-danger flex-1"
                        disabled={actionLoading}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        className="btn-success flex-1"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Approve
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        className="btn-danger flex-1"
                        disabled={actionLoading || !rejectReason.trim()}
                      >
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                        Confirm Reject
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-slate-500 text-xs">
        <Icon size={13} /> {label}
      </span>
      <span className="font-semibold text-slate-900 text-sm text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}