import { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, CheckCircle2, XCircle, Eye, Wallet, Clock,
  AlertTriangle, TrendingUp, Image as ImageIcon, ExternalLink, Filter,
} from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { payments as paymentsDB } from '../../services/localDB';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [reviewPayment, setReviewPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const loadPayments = () => {
    setLoading(true);
    setError('');
    try {
      setPayments(paymentsDB.listForAdmin());
    } catch {
      setError('Could not load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const handleApprove = (payment) => {
    if (!window.confirm(`Approve ₱${payment.amount.toLocaleString()} from ${payment.boarderName}?`)) return;
    setActionLoading(true);
    try {
      paymentsDB.approve(payment.id);
      setReviewPayment(null);
      loadPayments();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (payment) => {
    if (!rejectReason.trim()) return alert('Please provide a reason.');
    setActionLoading(true);
    try {
      paymentsDB.reject(payment.id, rejectReason.trim());
      setReviewPayment(null);
      setRejectReason('');
      setShowRejectInput(false);
      loadPayments();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openReview = (payment) => {
    setReviewPayment(payment);
    setRejectReason('');
    setShowRejectInput(false);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.boarderName?.toLowerCase().includes(search.toLowerCase()) ||
        p.room?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, filterStatus]);

  const summary = useMemo(() => ({
    pending: payments.filter((p) => p.status === 'pending').length,
    pendingAmount: payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
    totalCollected: payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
  }), [payments]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
          Payments
          {summary.pending > 0 && (
            <span className="chip bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {summary.pending} pending
            </span>
          )}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Verify payments and see history</p>
      </div>

      {/* Summary — 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        <BigStat icon={Clock} label="Pending" value={`₱${summary.pendingAmount.toLocaleString()}`} grad="from-amber-500 to-orange-600" />
        <BigStat icon={TrendingUp} label="Collected" value={`₱${summary.totalCollected.toLocaleString()}`} grad="from-emerald-500 to-teal-600" />
        <div className="col-span-2 lg:col-span-1">
          <BigStat icon={Wallet} label="Transactions" value={payments.length} grad="from-violet-500 to-fuchsia-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boarder, room, ref…"
            className="input pl-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'pending', 'paid', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`chip whitespace-nowrap capitalize ${
                filterStatus === s
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading…
        </div>
      ) : error ? (
        <div className="card text-center py-12 text-rose-600">{error}</div>
      ) : filteredPayments.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} className="text-violet-500" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">No payments</p>
          <p className="text-sm text-slate-500">Transactions appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((p) => (
            <button
              key={p.id}
              onClick={() => openReview(p)}
              className={`w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 p-4 active:scale-[0.99] transition hover:shadow-md ${
                p.status === 'pending' ? 'ring-2 ring-amber-200' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 truncate">{p.boarderName}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Room {p.room} · {p.method.toUpperCase()} · {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.reference || '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900">₱{p.amount.toLocaleString()}</p>
                  <Eye size={14} className="text-slate-400 ml-auto mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Review modal */}
      <Modal
        isOpen={!!reviewPayment}
        onClose={() => setReviewPayment(null)}
        title={reviewPayment?.status === 'pending' ? 'Verify Payment' : 'Payment Details'}
        size="lg"
      >
        {reviewPayment && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
              <p className="relative text-xs font-semibold uppercase opacity-80 mb-1">Amount</p>
              <p className="relative text-3xl font-bold">₱{reviewPayment.amount.toLocaleString()}</p>
              <p className="relative text-sm opacity-90 mt-1">
                {reviewPayment.boarderName} · Room {reviewPayment.room}
              </p>
            </div>

            <div className="space-y-2.5 text-sm">
              <Row label="Method" value={reviewPayment.method} />
              <Row label="Reference" value={reviewPayment.reference || '—'} mono />
              <Row label="Submitted" value={new Date(reviewPayment.createdAt).toLocaleString()} />
              <Row label="Status" value={<StatusBadge status={reviewPayment.status} />} />
            </div>

            {reviewPayment.receiptUrl && (
              <div>
                <p className="label">Uploaded Receipt</p>
                <a
                  href={reviewPayment.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-violet-400 transition"
                >
                  <img
                    src={reviewPayment.receiptUrl}
                    alt="Receipt"
                    className="w-full max-h-64 object-contain bg-slate-50"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/10 transition flex items-center justify-center">
                    <span className="opacity-0 hover:opacity-100 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <ExternalLink size={12} /> Open
                    </span>
                  </div>
                </a>
              </div>
            )}

            {reviewPayment.ocrText && (
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-500 flex items-center gap-1">
                  <ImageIcon size={12} /> OCR extracted text
                </summary>
                <pre className="mt-2 bg-slate-50 p-3 rounded-xl max-h-40 overflow-auto whitespace-pre-wrap text-[10px]">
                  {reviewPayment.ocrText}
                </pre>
              </details>
            )}

            {reviewPayment.status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Verify before approving:
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>Reference matches GCash/Maya log</li>
                  <li>Amount matches the claimed amount</li>
                  <li>Receipt looks genuine</li>
                </ul>
              </div>
            )}

            {showRejectInput && (
              <div>
                <label className="label">Reason for rejection</label>
                <textarea
                  className="input"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Reference not found"
                  autoFocus
                />
              </div>
            )}

            {reviewPayment.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {!showRejectInput ? (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="btn-danger flex-1 flex items-center justify-center gap-2 !text-sm"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(reviewPayment)}
                      disabled={actionLoading}
                      className="btn-success flex-1 flex items-center justify-center gap-2 !text-sm disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                      Approve
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                      className="btn-secondary flex-1 !text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(reviewPayment)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="btn-danger flex-1 flex items-center justify-center gap-2 !text-sm disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                      Confirm
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function BigStat({ icon: Icon, label, value, grad }) {
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${grad} text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/20 blur-xl" />
      <div className="relative flex items-center gap-1.5 mb-1">
        <Icon size={14} />
        <p className="text-[10px] font-bold uppercase opacity-90">{label}</p>
      </div>
      <p className="relative text-lg sm:text-xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-800 ${mono ? 'font-mono text-xs' : 'capitalize'}`}>{value}</span>
    </div>
  );
}