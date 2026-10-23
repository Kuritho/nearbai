import { useState, useEffect } from 'react';
import {
  Plus, Wallet, Search, CheckCircle2, FileText, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { rentPayments, tenants, houses } from '../../services/localDB';

export default function RentPayments() {
  const [items, setItems] = useState([]);
  const [tenantList, setTenantList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    tenantId: '', billingMonth: '', amountDue: '', amountPaid: '', paymentMethod: 'cash', orNumber: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (!current) return;
    setItems(rentPayments.listForHouse(current.id));
    setTenantList(tenants.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    const d = new Date();
    setForm({
      tenantId: '',
      billingMonth: d.toLocaleString('en-PH', { month: 'long', year: 'numeric' }),
      amountDue: '',
      amountPaid: '',
      paymentMethod: 'cash',
      orNumber: '',
      notes: '',
    });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      rentPayments.create({
        tenantId: form.tenantId,
        billingMonth: form.billingMonth,
        amountDue: Number(form.amountDue),
        amountPaid: Number(form.amountPaid) || 0,
        paymentMethod: form.paymentMethod,
        orNumber: form.orNumber,
        notes: form.notes,
      });
      toast('Rent bill created', 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = (r) => {
    if (!window.confirm(`Mark ${r.tenantName}'s ${r.billingMonth} rent as fully paid?`)) return;
    try {
      rentPayments.markPaid(r.id);
      toast('Marked as paid', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = items.filter((r) => {
    const matchesSearch =
      r.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      (r.billingMonth || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = {
    totalDue: items.reduce((s, r) => s + r.amountDue, 0),
    totalPaid: items.reduce((s, r) => s + r.amountPaid, 0),
    overdue: items.filter((r) => r.status !== 'paid').reduce((s, r) => s + r.balance, 0),
  };

  const fmt = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Rent Payments</h1>
          <p className="text-slate-600 text-sm mt-1">{items.length} record{items.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Create Bill
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card !p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Billed</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{fmt(summary.totalDue)}</p>
        </div>
        <div className="card !p-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Collected</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{fmt(summary.totalPaid)}</p>
        </div>
        <div className="card !p-3">
          <p className="text-[10px] font-bold text-rose-600 uppercase">Outstanding</p>
          <p className="text-lg font-bold text-rose-600 mt-1">{fmt(summary.overdue)}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenant, room, or month…" className="input pl-11" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'paid', 'partial', 'unpaid'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`chip whitespace-nowrap capitalize ${statusFilter === s ? 'bg-violet-600 text-white border-violet-700' : 'bg-white text-slate-600 border-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold mb-1">No rent records</p>
          <p className="text-sm text-slate-500">Create a bill to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card !p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{r.tenantName}</p>
                  <p className="text-xs text-slate-500">Room {r.roomNumber} · {r.billingMonth}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-lg font-bold text-slate-900">{fmt(r.amountPaid)}</p>
                  <p className="text-xs text-slate-500">of {fmt(r.amountDue)}</p>
                </div>
                {r.status !== 'paid' && (
                  <button onClick={() => handleMarkPaid(r)} className="flex items-center gap-1 text-sm py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                    <CheckCircle2 size={14} /> Mark Paid
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Rent Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Tenant</label>
            <select className="input" required value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">Select tenant…</option>
              {tenantList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — Room {t.room?.number || '—'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Billing Month</label>
            <input className="input" required value={form.billingMonth} onChange={(e) => setForm({ ...form, billingMonth: e.target.value })} placeholder="e.g. October 2026" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount Due (₱)</label>
              <input type="number" min={0} className="input" required value={form.amountDue} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} />
            </div>
            <div>
              <label className="label">Amount Paid (₱)</label>
              <input type="number" min={0} className="input" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="label">OR Number</label>
              <input className="input" value={form.orNumber} onChange={(e) => setForm({ ...form, orNumber: e.target.value })} placeholder="e.g. 001234" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="optional" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating…' : 'Create Bill'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}