import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wallet, DoorOpen, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { rooms, tenants, rentPayments, houses } from '../../services/localDB';

export default function CaretakerDashboard() {
  const [data, setData] = useState({ rooms: [], tenants: [], rents: [] });
  const [house, setHouse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const current = houses.current();
    setHouse(current);
    if (current) {
      setData({
        rooms: rooms.list(current.id),
        tenants: tenants.list(current.id),
        rents: rentPayments.listForHouse(current.id).slice(0, 5),
      });
    }
  }, []);

  const totalCapacity = data.rooms.reduce((s, r) => s + r.bedCapacity, 0);
  const occupiedBeds = data.tenants.filter((t) => t.status === 'occupied').length;
  const occupancyRate =
    totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Caretaker Dashboard
        </h1>
        <p className="text-slate-600 text-sm mt-1 flex items-center gap-1.5">
          <Home size={13} />
          {house?.name || 'No property assigned'}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={DoorOpen} label="Rooms" value={data.rooms.length} color="violet" />
        <StatCard icon={Users} label="Tenants" value={data.tenants.length} color="emerald" />
        <StatCard icon={Wallet} label="Occupancy" value={`${occupancyRate}%`} color="blue" />
        <StatCard
          icon={Users}
          label="Occupied Beds"
          value={`${occupiedBeds}/${totalCapacity}`}
          color="amber"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/caretaker/tenants')}
          className="card text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <Users size={24} className="text-emerald-600 mb-2" />
              <p className="font-bold text-slate-900">Manage Tenants</p>
              <p className="text-xs text-slate-500">Process walk-ins & check-ins</p>
            </div>
            <ArrowRight size={20} className="text-slate-400" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/caretaker/rent')}
          className="card text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <Wallet size={24} className="text-violet-600 mb-2" />
              <p className="font-bold text-slate-900">Log Rent Payments</p>
              <p className="text-xs text-slate-500">Record & issue receipts</p>
            </div>
            <ArrowRight size={20} className="text-slate-400" />
          </div>
        </motion.button>
      </div>

      <div className="card">
        <h2 className="text-base font-bold text-slate-900 mb-3">Recent Rent</h2>
        {data.rents.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.rents.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {r.tenantName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Room {r.roomNumber} · {r.billingMonth}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-sm text-slate-900">
                    ₱{r.amountPaid.toLocaleString('en-PH')}
                  </p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}