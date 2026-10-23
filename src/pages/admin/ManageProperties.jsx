import { useState, useEffect } from 'react';
import { Plus, Building2, Pencil, Trash2, Search, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { houses } from '../../services/localDB';

const EMPTY = { name: '', address: '', contactNumber: '' };

export default function ManageProperties() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => setList(houses.list());
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setIsOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setForm({ name: h.name, address: h.address, contactNumber: h.contactNumber });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        houses.update(editing.id, form);
        toast(`Property "${form.name}" updated`, 'success');
      } else {
        houses.create(form);
        toast(`Property "${form.name}" created`, 'success');
      }
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (h) => {
    if (!window.confirm(`Delete "${h.name}"? All rooms must be deleted first.`)) return;
    try {
      houses.remove(h.id);
      load();
      toast('Property deleted', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = list.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Properties</h1>
          <p className="text-slate-600 text-sm mt-1">{list.length} boarding house{list.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search properties…" className="input pl-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex w-14 h-14 rounded-2xl bg-violet-100 border border-violet-200 items-center justify-center mb-4">
            <Building2 size={24} className="text-violet-600" />
          </motion.div>
          <p className="text-slate-900 font-semibold mb-1">No properties yet</p>
          <p className="text-sm text-slate-500 mb-5">Create your first boarding house to get started.</p>
          <button onClick={openCreate} className="btn-primary inline-flex"><Plus size={16} className="mr-1.5" /> Add Property</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((h, i) => (
              <motion.div key={h.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }} className="card-hover">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{h.name}</p>
                    <p className="text-xs text-slate-500">ID: {h.id.slice(0, 8)}</p>
                  </div>
                </div>
                {h.address && (
                  <p className="text-sm text-slate-600 flex items-start gap-1.5 mb-1.5">
                    <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{h.address}</span>
                  </p>
                )}
                {h.contactNumber && (
                  <p className="text-sm text-slate-600 flex items-center gap-1.5 mb-3">
                    <Phone size={13} className="text-slate-400" /> {h.contactNumber}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(h)} className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-medium transition">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(h)} className="flex items-center justify-center text-sm py-2 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? 'Edit Property' : 'Add New Property'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Property Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Branch" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. 123 Rizal St, Dumaguete City" />
          </div>
          <div>
            <label className="label">Contact Number</label>
            <input className="input" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="e.g. 09171234567" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}