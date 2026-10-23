import { useState, useEffect } from 'react';
import { Plus, Wrench, Search, Trash2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { expenses, houses } from '../../services/localDB';

const CATEGORIES = ['repair', 'utilities', 'supplies', 'salary', 'tax', 'other'];

export default function Expenses() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'repair', amount: '', dateLogged: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (current) setItems(expenses.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ description: '', category: 'repair', amount: '', dateLogged: new Date().toISOString().split('T')[0] });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const current = houses.current();
      expenses.create({ houseId: current.id, ...form });
      toast('Expense logged', 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      expenses.remove(id);
      toast('Expense deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = items.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-slate-600 text-sm mt-1">Maintenance & operating costs</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      <div className="card-gradient mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-white/60 border border-rose-200">
            <DollarSign size={16} className="text-rose-600" />
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase">Total Expenses</p>
        </div>
        <p className="text-3xl font-bold text-slate-900">₱{total.toLocaleString('en-PH')}</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses…" className="input pl-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold mb-1">No expenses logged</p>
          <p className="text-sm text-slate-500">Record repairs and upkeep costs.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card !p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                  <Wrench size={18} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{e.description}</p>
                  <p className="text-xs text-slate-500 capitalize">{e.category} · {e.dateLogged}</p>
                </div>
                <p className="font-bold text-slate-900 text-sm shrink-0">₱{e.amount.toLocaleString('en-PH')}</p>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Description</label>
            <input className="input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Replaced faucet in Room 102" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount (₱)</label>
              <input type="number" min={0} className="input" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" required value={form.dateLogged} onChange={(e) => setForm({ ...form, dateLogged: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Log Expense'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}