import { useState, useEffect } from 'react';
import { Plus, Users, Search, Trash2, Phone, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { tenants, rooms, houses } from '../../services/localDB';

const EMPTY = { name: '', email: '', password: '', phone: '', emergencyContact: '', roomId: '', moveInDate: '' };

export default function ManageTenants() {
  const [list, setList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (!current) return;
    setList(tenants.list(current.id));
    setRoomList(rooms.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({
      ...EMPTY,
      moveInDate: new Date().toISOString().split('T')[0],
    });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      tenants.create(form);
      toast(`Tenant "${form.name}" created`, 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this tenant? This also removes their rent records.')) return;
    try {
      tenants.remove(id);
      toast('Tenant deleted', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = list.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tenants</h1>
          <p className="text-slate-600 text-sm mt-1">{list.length} tenant{list.length !== 1 ? 's' : ''}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants…" className="input pl-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold mb-1">No tenants yet</p>
          <p className="text-sm text-slate-500 mb-5">Add your first tenant to get started.</p>
          <button onClick={openCreate} className="btn-primary inline-flex"><Plus size={16} className="mr-1.5" /> Add Tenant</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card !p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow shrink-0">
                  {t.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.email}</p>
                    </div>
                    <StatusBadge status={t.status || 'occupied'} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="chip bg-violet-100 text-violet-700 border-violet-200">
                      <Home size={11} /> Room {t.room?.number || '—'}
                    </span>
                    {t.phone && (
                      <span className="chip bg-emerald-100 text-emerald-700 border-emerald-200">
                        <Phone size={11} /> {t.phone}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Tenant">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="text" className="input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="temporary password" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09171234567" />
            </div>
            <div>
              <label className="label">Move-in Date</label>
              <input type="date" className="input" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Emergency Contact</label>
            <input className="input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Name — phone number" />
          </div>
          <div>
            <label className="label">Assign Room</label>
            <select className="input" required value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              <option value="">Select a room…</option>
              {roomList.map((r) => (
                <option key={r.id} value={r.id} disabled={r.occupants >= r.bedCapacity}>
                  Room {r.roomNumber} ({r.occupants}/{r.bedCapacity})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating…' : 'Create Account'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}