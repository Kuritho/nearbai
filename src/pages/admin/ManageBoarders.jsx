import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Users, Phone, Mail } from 'lucide-react';
import Modal from '../../components/Modal';
import { boarders as boardersDB, rooms as roomsDB } from '../../services/localDB';

export default function ManageBoarders() {
  const [boarders, setBoarders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', roomId: '' });
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setBoarders(boardersDB.list());
    setRooms(roomsDB.list());
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      boardersDB.create(form);
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', roomId: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this boarder account?')) return;
    try {
      boardersDB.remove(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = boarders.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Boarders</h1>
          <p className="text-slate-500 text-sm mt-1">{boarders.length} total</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search boarders…"
          className="input pl-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-violet-500" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">No boarders yet</p>
          <p className="text-sm text-slate-500 mb-5">Add your first boarder account.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary inline-flex">
            <Plus size={16} className="mr-1.5" /> Add Boarder
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block card">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Room</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-semibold text-slate-700">{b.name}</td>
                    <td className="py-3 text-slate-600">{b.email}</td>
                    <td className="py-3 text-slate-600">{b.room?.number || '—'}</td>
                    <td className="py-3 text-slate-600">{b.phone || '—'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow shrink-0">
                    {b.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{b.name}</p>
                    <p className="text-xs text-slate-500 truncate">{b.email}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 active:scale-95 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  <span className="chip bg-violet-100 text-violet-700">
                    Room {b.room?.number || '—'}
                  </span>
                  {b.phone && (
                    <span className="chip bg-emerald-100 text-emerald-700">
                      <Phone size={11} /> {b.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Boarder">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email" className="input" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="text" className="input" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="temporary password"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="09171234567"
            />
          </div>
          <div>
            <label className="label">Assign Room</label>
            <select
              className="input" required
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            >
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id} disabled={r.occupants >= r.capacity}>
                  Room {r.number} ({r.occupants}/{r.capacity})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}