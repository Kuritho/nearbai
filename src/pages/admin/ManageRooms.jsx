import { useState, useEffect } from 'react';
import {
  Plus, DoorOpen, Users, Pencil, Trash2, Search, CheckCircle2, Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { rooms as roomsDB, houses } from '../../services/localDB';

const EMPTY = { roomNumber: '', bedCapacity: 4, monthlyRate: 0, notes: '' };

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (current) setRooms(roomsDB.list(current.id));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError('');
    setIsOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      roomNumber: room.roomNumber,
      bedCapacity: room.bedCapacity,
      monthlyRate: room.monthlyRate,
      notes: room.notes || '',
    });
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const current = houses.current();
      if (editing) {
        roomsDB.update(editing.id, form);
        toast(`Room ${form.roomNumber} updated`, 'success');
      } else {
        roomsDB.create({ houseId: current.id, ...form });
        toast(`Room ${form.roomNumber} created`, 'success');
      }
      setIsOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (room) => {
    if (room.occupants > 0) {
      return toast(`Cannot delete — ${room.occupants} tenant(s) still inside`, 'error');
    }
    if (!window.confirm(`Delete Room ${room.roomNumber}?`)) return;
    try {
      roomsDB.remove(room.id);
      toast(`Room ${room.roomNumber} deleted`, 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // ✅ SAFE filtering — uses roomNumber, handles undefined
  const filtered = rooms.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const num = (r.roomNumber || '').toString().toLowerCase();
    const notes = (r.notes || '').toLowerCase();
    return num.includes(q) || notes.includes(q);
  });

  const totalBeds = rooms.reduce((s, r) => s + (Number(r.bedCapacity) || 0), 0);
  const occupiedBeds = rooms.reduce((s, r) => s + (Number(r.occupants) || 0), 0);
  const occupancyRate =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Rooms</h1>
          <p className="text-slate-600 text-sm mt-1">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} · {occupiedBeds}/{totalBeds} beds filled
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm"
        >
          <Plus size={16} className="mr-1.5" /> Add
        </motion.button>
      </div>

      {/* Occupancy bar */}
      {rooms.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-gradient mb-5">
          <div className="flex items-center gap-4">
            <CircularProgress value={occupancyRate} />
            <div className="flex-1">
              <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">Occupancy Rate</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{occupancyRate}%</p>
              <p className="text-slate-500 text-xs mt-1">
                {occupiedBeds} of {totalBeds} beds occupied
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rooms…"
          className="input pl-11"
        />
      </div>

      {/* Room grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex w-16 h-16 rounded-2xl bg-indigo-50 items-center justify-center mb-4"
          >
            <DoorOpen size={28} className="text-indigo-500" />
          </motion.div>
          <p className="text-slate-900 font-bold mb-1">
            {search ? 'No matching rooms' : 'No rooms yet'}
          </p>
          <p className="text-sm text-slate-500 mb-5">
            {search ? 'Try a different search.' : 'Create your first room to get started.'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary inline-flex">
              <Plus size={16} className="mr-1.5" /> Add Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((room, i) => {
              const full = room.occupants >= room.bedCapacity;
              return (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -3 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        full ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <DoorOpen size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base leading-tight">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₱{Number(room.monthlyRate).toLocaleString('en-PH')}/mo
                        </p>
                      </div>
                    </div>
                    <span className={full ? 'chip-rose' : 'chip-emerald'}>
                      {full ? 'FULL' : 'OPEN'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
                    <Users size={14} />
                    <span>{room.occupants} / {room.bedCapacity} beds</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (room.occupants / room.bedCapacity) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        full ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                    />
                  </div>

                  {room.notes && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{room.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-semibold transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="flex items-center justify-center text-sm py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? `Edit Room ${editing.roomNumber}` : 'Add New Room'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="label">Room Number</label>
            <input
              className="input" required
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              placeholder="e.g. 101, A-2"
              disabled={!!editing}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Bed Capacity</label>
              <input
                type="number" min={1} max={20} className="input" required
                value={form.bedCapacity}
                onChange={(e) => setForm({ ...form, bedCapacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Monthly Rate (₱)</label>
              <input
                type="number" min={0} className="input" required
                value={form.monthlyRate}
                onChange={(e) => setForm({ ...form, monthlyRate: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input" rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Air-conditioned, 2nd floor"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CircularProgress({ value }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="transform -rotate-90" width="80" height="80">
        <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <motion.circle
          cx="40" cy="40" r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Home size={20} className="text-indigo-500" />
      </div>
    </div>
  );
}