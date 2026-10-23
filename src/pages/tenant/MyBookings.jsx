import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, Home, Building2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { bookings, houses } from '../../services/localDB';

export default function MyBookings() {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  const load = () => {
    const all = bookings.listForTenant(user.id);
    const allHouses = houses.list();
    setList(all.map((b) => {
      const room = JSON.parse(localStorage.getItem('nb_rooms') || '[]').find((r) => r.id === b.roomId);
      const house = allHouses.find((h) => h.id === room?.houseId);
      return { ...b, house };
    }));
  };

  useEffect(() => { load(); }, [user.id]);

  const handleCancel = (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      bookings.cancel(id, true);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
        <p className="text-slate-600 text-sm mt-1">Track your reservation requests</p>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-bold mb-1">No bookings yet</p>
          <p className="text-sm text-slate-500 mb-4">Browse houses and reserve a bed to get started.</p>
          <Link to="/browse" className="btn-primary inline-flex"><Building2 size={16} className="mr-1.5" /> Browse Houses</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <div key={b.id} className="card !p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{b.house?.name || 'House'}</p>
                  <p className="text-xs text-slate-500">Room {b.roomNumber} · Bed {b.bedNumber}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{b.reference}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-slate-100">
                <span className="text-slate-500 text-xs">Move-in: {b.moveInDate}</span>
                {b.status === 'pending' && (
                  <button onClick={() => handleCancel(b.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}