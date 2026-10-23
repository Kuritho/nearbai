import { useState, useEffect } from 'react';
import {
  Plus, Receipt, Loader2, Search, Trash2, CheckCircle2,
  Zap, Droplet, Home, MoreHorizontal, Users,
} from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { bills as billsDB, rooms as roomsDB } from '../../services/localDB';

const BILL_TYPES = [
  { id: 'rent',        label: 'Rent',        icon: Home,           grad: 'from-violet-500 to-fuchsia-500' },
  { id: 'electricity', label: 'Electricity', icon: Zap,            grad: 'from-amber-500 to-orange-500' },
  { id: 'water',       label: 'Water',       icon: Droplet,        grad: 'from-sky-500 to-blue-500' },
  { id: 'other',       label: 'Other',       icon: MoreHorizontal, grad: 'from-slate-500 to-slate-600' },
];

const EMPTY_FORM = {
  type: 'rent', amount: '', dueDate: '', description: '', roomId: '', assignAll: false,
};

export default function ManageBills() {
  const [bills, setBills] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    try {
      setBills(billsDB.listForAdmin());
      setRooms(roomsDB.list());
    } catch {
      setError('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.roomId) return setError('Please select a room.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount.');

    setSaving(true);
    try {
      billsDB.create({
        type: form.type,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        description: form.description,
        roomId: form.roomId,
        assignAll: form.assignAll,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (bill) => {
    if (bill.status === 'paid') return alert('Paid bills cannot be deleted.');
    if (!window.confirm(`Delete this ${bill.type} bill for ${bill.boarderName}?`)) return;
    try {
      billsDB.remove(bill.id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkPaid = (bill) => {
    if (!window.confirm(`Mark ${bill.type} bill of ${bill.boarderName} as PAID?`)) return;
    try {
      billsDB.markPaid(bill.id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = bills.filter((b) => {
    const matchesSearch =
      b.boarderName?.toLowerCase().includes(search.toLowerCase()) ||
      b.room?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const typeGrad = (type) => BILL_TYPES.find((t) => t.id === type)?.grad || 'from-slate-500 to-slate-600';
  const typeIcon = (type) => BILL_TYPES.find((t) => t.id === type)?.icon || Receipt;

  const summary = {
    total: bills.reduce((s, b) => s + b.amount, 0),
    paid: bills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0),
    pending: bills.filter((b) => b.status === 'pending').reduce((s, b) => s + b.amount, 0),
    overdue: bills.filter((b) => b.status === 'overdue').reduce((s, b) => s + b.amount, 0),
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Manage rent, utilities, and more</p>
        </div>
        <button onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Create
        </button>
      </div>

      {/* Summary cards — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        <MiniSummary label="Billed" value={summary.total} color="from-slate-600 to-slate-800" />
        <MiniSummary label="Paid" value={summary.paid} color="from-emerald-500 to-teal-600" />
        <MiniSummary label="Pending" value={summary.pending} color="from-amber-500 to-orange-600" />
        <MiniSummary label="Overdue" value={summary.overdue} color="from-rose-500 to-pink-600" />
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boarder or room…"
            className="input pl-11"
          />
        </div>

        {/* Horizontal scroll filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'pending', 'paid', 'overdue'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`chip whitespace-nowrap capitalize transition ${
                filterStatus === s
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {s === 'all' ? 'All Bills' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Bills */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
            <Receipt size={28} className="text-amber-500" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">No bills found</p>
          <p className="text-sm text-slate-500 mb-5">
            {bills.length === 0 ? 'Create your first bill.' : 'Try different filters.'}
          </p>
          {bills.length === 0 && (
            <button onClick={openCreate} className="btn-primary inline-flex">
              <Plus size={16} className="mr-1.5" /> Create Bill
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden !p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold">Boarder</th>
                  <th className="px-3 py-3 font-semibold">Type</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Due</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const Icon = typeIcon(b.type);
                  const grad = typeGrad(b.type);
                  return (
                    <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{b.boarderName}</p>
                        <p className="text-xs text-slate-500">Room {b.room}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`chip bg-gradient-to-r ${grad} text-white`}>
                          <Icon size={11} /> {b.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800">₱{b.amount.toLocaleString()}</td>
                      <td className="px-3 py-3 text-slate-600 text-xs">
                        {new Date(b.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {b.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(b)}
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b)}
                            disabled={b.status === 'paid'}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="lg:hidden space-y-2">
            {filtered.map((b) => {
              const Icon = typeIcon(b.type);
              const grad = typeGrad(b.type);
              return (
                <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{b.boarderName}</p>
                          <p className="text-xs text-slate-500">Room {b.room}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-lg font-bold text-slate-900">₱{b.amount.toLocaleString()}</p>
                          <p className="text-[11px] text-slate-500">
                            Due {new Date(b.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {b.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(b)}
                              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 active:scale-95 transition"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b)}
                            disabled={b.status === 'paid'}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 active:scale-95 transition disabled:opacity-30"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Bill Type</label>
            <div className="grid grid-cols-4 gap-2">
              {BILL_TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition ${
                      active ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-slate-200'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-violet-600' : 'text-slate-500'} />
                    <span className={`text-[10px] font-semibold ${active ? 'text-violet-700' : 'text-slate-600'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₱)</label>
              <input
                type="number" min={0} step="0.01" className="input" required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date" className="input" required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Assign to Room</label>
            <select
              className="input" required
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            >
              <option value="">Select a room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.occupants}/{r.capacity})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={form.assignAll}
              onChange={(e) => setForm({ ...form, assignAll: e.target.checked })}
              className="w-4 h-4 accent-violet-600 mt-0.5"
            />
            <div className="flex items-start gap-2 text-sm">
              <Users size={14} className="text-violet-600 mt-0.5 shrink-0" />
              <span className="text-slate-700">
                Create separate bill for <strong>each boarder</strong> in this room
              </span>
            </div>
          </label>

          <div>
            <label className="label">Description (optional)</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. October electricity"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MiniSummary({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-3 bg-gradient-to-br ${color} text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/20 blur-xl" />
      <p className="relative text-[10px] font-semibold uppercase opacity-80">{label}</p>
      <p className="relative text-base sm:text-lg font-bold mt-0.5">₱{Number(value).toLocaleString()}</p>
    </div>
  );
}