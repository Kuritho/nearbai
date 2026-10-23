import { useState, useEffect } from 'react';
import { Plus, Users, Trash2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { houses } from '../../services/localDB';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'caretaker', houseId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const all = JSON.parse(localStorage.getItem('nb_users') || '[]');
    setUsers(all.filter((u) => u.role !== 'tenant'));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    const h = houses.current();
    setForm({ name: '', email: '', password: '', phone: '', role: 'caretaker', houseId: h?.id || '' });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const all = JSON.parse(localStorage.getItem('nb_users') || '[]');
      if (all.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
        throw new Error('Email already in use');
      }
      all.push({
        id: Date.now().toString(36),
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        houseIds: form.houseId ? [form.houseId] : [],
        phone: form.phone,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('nb_users', JSON.stringify(all));
      toast(`${form.role === 'admin' ? 'Administrator' : 'Caretaker'} account created`, 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u) => {
    if (u.role === 'admin') {
      return toast('Cannot delete the administrator account', 'error');
    }
    if (!window.confirm(`Delete ${u.name}?`)) return;
    const all = JSON.parse(localStorage.getItem('nb_users') || '[]');
    localStorage.setItem('nb_users', JSON.stringify(all.filter((x) => x.id !== u.id)));
    toast('Account deleted', 'success');
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-slate-600 text-sm mt-1">Administrators & caretakers</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      {users.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold mb-1">No user accounts yet</p>
          <p className="text-sm text-slate-500">Add a caretaker to help manage operations.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card !p-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  u.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' : 'bg-gradient-to-br from-sky-500 to-blue-600'
                }`}>
                  {u.role === 'admin' ? <Shield size={18} className="text-white" /> : <Users size={18} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`chip ${u.role === 'admin' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-sky-100 text-sky-700 border-sky-200'} capitalize`}>
                      {u.role}
                    </span>
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => handleDelete(u)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="caretaker">Caretaker</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="text" className="input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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