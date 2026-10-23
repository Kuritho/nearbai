import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DoorOpen, Wallet, AlertTriangle, TrendingUp,
  ArrowRight, Receipt, Home, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { analytics, houses } from '../../services/localDB';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [house, setHouse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const current = houses.current();
    setHouse(current);
    if (current) setData(analytics.dashboard(current.id));
  }, []);

  if (!data) {
    return <p className="p-8 text-slate-500">Loading dashboard…</p>;
  }

  const fmt = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-600 text-sm mt-1 flex items-center gap-1.5">
          <Home size={13} />
          {house?.name || 'No property selected'}
        </p>
      </motion.div>

      {/* Pending reservations banner */}
      {data.pendingReservations > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/admin/reservations')}
          className="w-full mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shrink-0"
            >
              <Clock size={20} className="text-white" />
            </motion.div>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                {data.pendingReservations} reservation{data.pendingReservations > 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-amber-700">Review guest requests from the public form</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-amber-600 shrink-0" />
        </motion.button>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={DoorOpen} label="Rooms" value={data.roomsCount} color="indigo" />
        <StatCard icon={Users} label="Tenants" value={data.tenantsCount} color="emerald" />
        <StatCard icon={TrendingUp} label="Occupancy" value={`${data.occupancyRate}%`} color="sky" />
        <StatCard icon={AlertTriangle} label="Overdue" value={data.overdue} color="rose" />
      </div>

      {/* Financial summary */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-gradient"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-white/60 border border-indigo-200">
              <Wallet size={16} className="text-indigo-600" />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Collections
            </p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{fmt(data.totalCollections)}</p>
          <p className="text-xs text-slate-600 mt-1">
            Rent {fmt(data.totalRentPaid)} + Utilities {fmt(data.totalUtil)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-200">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Net Income
            </p>
          </div>
          <p className={`text-3xl font-extrabold ${data.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {fmt(data.netIncome)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {fmt(data.totalCollections)} − {fmt(data.totalExpenses)} expenses
          </p>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card mb-6"
      >
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickAction
            icon={DoorOpen}
            label="Setup"
            sub="Rooms & rates"
            color="from-indigo-500 to-violet-600"
            onClick={() => navigate('/admin/rooms')}
          />
          <QuickAction
            icon={Users}
            label="Onboard"
            sub="New tenant"
            color="from-emerald-500 to-teal-600"
            onClick={() => navigate('/admin/tenants')}
          />
          <QuickAction
            icon={Receipt}
            label="Collect"
            sub="Rent & utilities"
            color="from-sky-500 to-blue-600"
            onClick={() => navigate('/admin/rent')}
          />
          <QuickAction
            icon={TrendingUp}
            label="Analytics"
            sub="Net income"
            color="from-amber-500 to-orange-600"
            onClick={() => navigate('/admin/analytics')}
          />
        </div>
      </motion.div>

      {/* Recent rent payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Rent Payments</h2>
          <button
            onClick={() => navigate('/admin/rent')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {data.recentRent.length === 0 ? (
          <div className="text-center py-8">
            <Wallet size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No rent records yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentRent.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm truncate">{p.tenantName}</p>
                  <p className="text-xs text-slate-500">
                    Room {p.roomNumber} · {p.billingMonth}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-slate-900 text-sm">
                    ₱{p.amountPaid.toLocaleString('en-PH')}
                  </p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, sub, color, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="text-left rounded-2xl bg-gradient-to-r p-[1px] shadow-sm hover:shadow-md transition"
    >
      <div className={`rounded-2xl bg-white/90 px-3 py-3 ${color}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-white/15 text-white">
            <Icon size={16} />
          </div>
          <span className="text-white font-bold text-sm">{label}</span>
        </div>
        <p className="text-xs text-white/80">{sub}</p>
      </div>
    </motion.button>
  );
}