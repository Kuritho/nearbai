import { useState, useEffect } from 'react';
import { Plus, Receipt, Search, Users, Zap, Droplets } from 'lucide-react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { utilityCharges, rooms, houses } from '../../services/localDB';

export default function UtilityCharges() {
  const [items, setItems] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [selectedRoom, setSelectedRoom] = useState('');
  const [chargeType, setChargeType] = useState('electricity');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    const c = houses.current();
    if (c) {
      setItems(utilityCharges.listForHouse(c.id));
      setRoomList(rooms.list(c.id));
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setSelectedRoom('');
    setChargeType('electricity');
    setBillingPeriod(new Date().toLocaleString('en-PH', { month: 'long', year: 'numeric' }));
    setTotalAmount('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const room = roomList.find(r => r.id === selectedRoom);
      if (!room) throw new Error('Please select a room');
      if (!totalAmount || Number(totalAmount) <= 0) throw new Error('Please enter a valid total amount');

      const result = utilityCharges.generateRoomUtilities({
        roomId: selectedRoom,
        chargeType,
        billingPeriod,
        totalAmount: Number(totalAmount),
      });

      toast(`Generated ${result.count} bills for Room ${room.roomNumber}. ₱${result.perPerson.toLocaleString('en-PH')} each.`, 'success');
      setIsOpen(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((c) => c.tenantName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Utility Charges</h1>
          <p className="text-slate-600 text-sm mt-1">{items.length} charge{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> Bill a Room
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenant…" className="input pl-11" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-semibold">No charges</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="card !p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm capitalize">{c.chargeType}</p>
                <p className="text-xs text-slate-500">{c.tenantName} · {c.billingPeriod}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">₱{c.amountBilled.toLocaleString('en-PH')}</p>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Bill a Room (Auto-Split)">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="label">Select Room</label>
            <select className="input" required value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              <option value="">Choose a room…</option>
              {roomList.map((r) => (
                <option key={r.id} value={r.id} disabled={r.occupants === 0}>
                  Room {r.roomNumber} — {r.occupants} tenant(s)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Charge Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setChargeType('electricity')} className={`p-3 rounded-xl border-2 transition text-center ${chargeType === 'electricity' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                <Zap size={18} className={`mx-auto mb-1 ${chargeType === 'electricity' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <p className="text-xs font-semibold">Electricity</p>
              </button>
              <button type="button" onClick={() => setChargeType('water')} className={`p-3 rounded-xl border-2 transition text-center ${chargeType === 'water' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                <Droplets size={18} className={`mx-auto mb-1 ${chargeType === 'water' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <p className="text-xs font-semibold">Water</p>
              </button>
            </div>
          </div>

          <div>
            <label className="label">Billing Period</label>
            <input className="input" required value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} />
          </div>

          {/* Show split preview */}
          {selectedRoom && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-900 uppercase">Auto-Split Preview</p>
              </div>
              {(() => {
                const room = roomList.find(r => r.id === selectedRoom);
                const amt = Number(totalAmount) || 0;
                const split = Math.ceil(amt / (room.occupants || 1));
                return (
                  <p className="text-sm text-amber-800">
                    <strong>{room.occupants}</strong> tenant(s) will be billed <strong>₱{split.toLocaleString('en-PH')}</strong> each.
                  </p>
                );
              })()}
            </div>
          )}

          <div>
            <label className="label">Total Amount for the Room (₱)</label>
            <input type="number" className="input" required value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g. 2000" />
            <p className="text-[10px] text-slate-500 mt-1">Enter the total bill (e.g. ₱2,000). The system divides it by the number of tenants.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Generating…' : 'Generate Charges'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
