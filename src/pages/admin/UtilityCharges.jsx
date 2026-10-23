import { useState, useEffect } from 'react';
import { Plus, Receipt, Search, CheckCircle2, Zap, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { utilityCharges, tenants, houses } from '../../services/localDB';

const TYPES = [
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'from-amber-500 to-orange-600' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'from-sky-500 to-blue-600' },
  { id: 'fixed', label: 'Fixed Add-on', icon: Receipt, color: 'from-violet-500 to-fuchsia-600' },
];

export default function UtilityCharges() {
  const [items, setItems] = useState([]);
  const [tenantList, setTenantList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ tenantId: '', chargeType: 'electricity', amountBilled: '', billingPeriod: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (!current) return;
    setItems(utilityCharges.listForHouse(current.id));
    setTenantList(tenants.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    const d = new Date();
    setForm({
      tenantId: '',
      chargeType: 'electricity',
      amountBilled: '',
      billingPeriod: d.toLocaleString('en-PH', { month: 'long', year: 'numeric' }),
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
      utilityCharges.create(form);
      toast('Utility charge created', 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = (c) => {
    if (!window.confirm(`Mark ${c.chargeType} for ${c.tenantName} as paid?`)) return;
    try {
      utilityCharges.markPaid(c.id);
      toast('Marked as paid', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = items.filter((c) =>
    c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
    c.chargeType.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Utility Charges</h1>
          <p className="text-slate-600 text-sm mt-1">Sub-metered & fixed add-ons</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenant or type…" className="input pl-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold mb-1">No utility charges</p>
          <p className="text-sm text-slate-500">Add your first utility bill.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const t = TYPES.find((x) => x.id === c.chargeType) || TYPES[0];
            const Icon = t.icon;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card !p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm capitalize">{c.chargeType}</p>
                        <p className="text-xs text-slate-500">{c.tenantName} · {c.billingPeriod}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-lg font-bold text-slate-900">{fmt(c.amountBilled)}</p>
                      {c.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(c)} className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                          <CheckCircle2 size={13} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Utility Charge">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Tenant</label>
            <select className="input" required value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">Select tenant…</option>
              {tenantList.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — Room {t.room?.number || '—'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Charge Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.chargeType === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setForm({ ...form, chargeType: t.id })} className={`p-3 rounded-xl border-2 transition text-center ${active ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}>
                    <Icon size={18} className={`mx-auto mb-1 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
                    <p className="text-xs font-semibold">{t.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Billing Period</label>
            <input className="input" required value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} placeholder="e.g. October 2026" />
          </div>
          <div>
            <label className="label">Amount Billed (₱)</label>
            <input type="number" min={0} className="input" required value={form.amountBilled} onChange={(e) => setForm({ ...form, amountBilled: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="optional" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Add Charge'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}