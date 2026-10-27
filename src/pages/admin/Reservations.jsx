import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Loader2, Phone, Home, Clock, AlertTriangle, BedDouble } from 'lucide-react';
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
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [tempPassword, setTempPassword] = useState('Tenant123!');
  const toast = useToast();

  const load = () => {
    const c = houses.current();
    if (c) setItems(reservations.list(c.id));
  };
  useEffect(() => { load(); }, []);

  const openReview = (r) => {
    setReview(r);
    setRejectReason('');
    setShowReject(false);
    setTempPassword('Tenant123!');
  };

  const handleApprove = () => {
    if (!tempPassword || tempPassword.length < 6) return toast('Password needs 6+ chars', 'error');
    setActionLoading(true);
    try {
      // Pass the type so localDB knows which list to approve
      reservations.approve(review.id, tempPassword, review.type);
      toast('Approved — tenant created', 'success');
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
      reservations.reject(review.id, rejectReason, review.type);
      toast('Rejected', 'success');
      setReview(null);
      load();
    } catch (err) { 
      toast(err.message, 'error'); 
    } finally { 
      setActionLoading(false); 
    }
  };

  const filtered = items.filter((r) => {
    const term = search.toLowerCase();
    const nameMatch = (r.fullName || '').toLowerCase().includes(term);
    const refMatch = (r.reference || '').toLowerCase().includes(term);
    return (nameMatch || refMatch) && (filterStatus === 'all' || r.status === filterStatus);
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reservations</h1>
        <p className="text-slate-600 text-sm mt-1">Review guest requests and tenant bookings</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or reference…" className="input pl-11" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`chip capitalize ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold">No reservations found</p>
          <p className="text-sm text-slate-500">Try changing the filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => openReview(r)} className="w-full text-left card !p-4 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow shrink-0">
                  {r.fullName?.[0]?.toUpperCase() || '?'}
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
                    <span className="chip-violet"><Home size={11} /> Room {r.roomNumber}</span>
                    {r.bedNumber && (
                      <span className="chip-amber"><BedDouble size={11} /> Bed {r.bedNumber}</span>
                    )}
                    <span className="chip-slate"><Phone size={11} /> {r.phone}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={!!review} onClose={() => setReview(null)} title={review?.status === 'pending' ? 'Review Request' : 'Details'} size="lg">
        {review && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Reference</p>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">{review.reference}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="chip-violet"><Home size={11} /> Room {review.roomNumber}</span>
                {review.bedNumber && (
                  <span className="chip-amber"><BedDouble size={11} /> Bed {review.bedNumber}</span>
                )}
                <StatusBadge status={review.status} />
              </div>
            </div>

            <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p><span className="text-slate-500 w-16 inline-block">Name:</span> <strong>{review.fullName}</strong></p>
              <p><span className="text-slate-500 w-16 inline-block">Phone:</span> {review.phone}</p>
              {review.email && <p><span className="text-slate-500 w-16 inline-block">Email:</span> {review.email}</p>}
              <p><span className="text-slate-500 w-16 inline-block">Move-in:</span> {review.moveInDate}</p>
              <p><span className="text-slate-500 w-16 inline-block">Type:</span> <span className="capitalize">{review.type === 'guest' ? 'Online Request' : 'Tenant Booking'}</span></p>
            </div>

            {review.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-800 uppercase mb-1">Notes</p>
                <p className="text-sm text-amber-900">{review.notes}</p>
              </div>
            )}

            {review.status === 'pending' && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Approving will create a tenant account. Use the temporary password below.
                  </p>
                </div>

                <div>
                  <label className="label">Temporary Password</label>
                  <input className="input font-mono" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} />
                </div>

                {showReject && (
                  <div>
                    <label className="label">Reason for Rejection</label>
                    <textarea className="input" rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Room is full." />
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  {!showReject ? (
                    <>
                      <button onClick={() => setShowReject(true)} className="btn-danger flex-1" disabled={actionLoading}>
                        <XCircle size={16} /> Reject
                      </button>
                      <button onClick={handleApprove} className="btn-success flex-1" disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Approve
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setShowReject(false)} className="btn-secondary flex-1">Cancel</button>
                      <button onClick={handleReject} className="btn-danger flex-1" disabled={actionLoading || !rejectReason.trim()}>
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
