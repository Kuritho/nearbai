import { useState, useEffect } from 'react';
import {
  Plus, DoorOpen, Users, Pencil, Trash2, Search, Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/Modal';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/Toast';
import { rooms as roomsDB, houses } from '../../services/localDB';

const EMPTY = {
  roomNumber: '',
  bedCapacity: 4,
  monthlyRate: 0,
  gender: 'mixed',
  notes: '',
  imageUrl: '',
};

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    const c = houses.current();
    if (c) setRooms(roomsDB.list(c.id));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setIsOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      roomNumber: room.roomNumber,
      bedCapacity: room.bedCapacity,
      monthlyRate: room.monthlyRate,
      gender: room.gender || 'mixed',
      notes: room.notes || '',
      imageUrl: room.imageUrl || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const c = houses.current();
      if (editing) {
        roomsDB.update(editing.id, form);
        toast(`Room ${form.roomNumber} updated`, 'success');
      } else {
        roomsDB.create({ houseId: c.id, ...form });
        toast(`Room ${form.roomNumber} created`, 'success');
      }
      setIsOpen(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
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

  const filtered = rooms.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (r.roomNumber || '').toString().toLowerCase().includes(q);
  });

  const totalBeds = rooms.reduce((s, r) => s + (Number(r.bedCapacity) || 0), 0);
  const occupiedBeds = rooms.reduce((s, r) => s + (Number(r.occupants) || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Rooms</h1>
          <p className="text-slate-600 text-sm mt-1">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} · {occupiedBeds}/{totalBeds} beds filled
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Add
        </button>
      </div>

      {/* Occupancy bar */}
      {rooms.length > 0 && (
        <div className="card-gradient mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">Occupancy Rate</p>
            <p className="text-2xl font-extrabold text-slate-900">{occupancyRate}%</p>
          </div>
          <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyRate}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{occupiedBeds} of {totalBeds} beds occupied</p>
        </div>
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <DoorOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-bold mb-1">
            {search ? 'No matching rooms' : 'No rooms yet'}
          </p>
          <p className="text-sm text-slate-500 mb-5">
            {search ? 'Try a different search.' : 'Add your first room to get started.'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary inline-flex">
              <Plus size={16} className="mr-1.5" /> Add Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((room, i) => {
              const full = room.occupants >= room.bedCapacity;
              return (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -3 }}
                  className="card !p-0 overflow-hidden"
                >
                  {/* Image preview */}
                  <div className="aspect-video bg-slate-100 relative">
                    {room.imageUrl ? (
                      <img
                        src={room.imageUrl}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white/80">
                        <ImageIcon size={32} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No photo</span>
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${
                      full ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {full ? 'FULL' : 'OPEN'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900">Room {room.roomNumber}</p>
                        <p className="text-xs text-slate-500">
                          ₱{Number(room.monthlyRate).toLocaleString('en-PH')}/mo · {room.gender}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                      <Users size={13} />
                      <span>{room.occupants} / {room.bedCapacity} beds</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(room)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="flex items-center justify-center text-sm py-2 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Photo uploader */}
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            label="Room Photo"
          />

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
            <label className="label">Gender</label>
            <select
              className="input"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="mixed">Mixed</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input" rows={2}
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