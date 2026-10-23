import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Wrench, Users, DoorOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../../components/StatCard';
import { analytics, houses } from '../../services/localDB';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [house, setHouse] = useState(null);

  useEffect(() => {
    const current = houses.current();
    setHouse(current);
    if (current) setData(analytics.dashboard(current.id));
  }, []);

  if (!data) return <p className="p-8 text-slate-500">Loading…</p>;

  const fmt = (n) => `₱${Number(n).toLocaleString('en-PH')}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-600 text-sm mt-1">{house?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label="Tenants" value={data.tenantsCount} color="violet" />
        <StatCard icon={DoorOpen} label="Occupancy" value={`${data.occupancyRate}%`} color="emerald" />
        <StatCard icon={AlertCircle} label="Overdue" value={data.overdue} color="rose" />
        <StatCard icon={TrendingUp} label="Net Income" value={fmt(data.netIncome)} color="blue" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-200">
              <Wallet size={16} className="text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase">Collections</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{fmt(data.totalCollections)}</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Rent collected</span>
              <span className="font-semibold text-slate-800">{fmt(data.totalRentPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Utilities collected</span>
              <span className="font-semibold text-slate-800">{fmt(data.totalUtil)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-rose-100 border border-rose-200">
              <Wrench size={16} className="text-rose-600" />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase">Expenses</p>
          </div>
          <p className="text-3xl font-bold text-slate-900">{fmt(data.totalExpenses)}</p>
          <p className="text-xs text-slate-500 mt-3">Logged maintenance and operating costs</p>
        </motion.div>
      </div>

      <div className="card mb-4">
        <h2 className="text-base font-bold text-slate-900 mb-3">Occupancy</h2>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-slate-600">Occupied beds</span>
          <span className="font-bold text-slate-900">{data.occupiedBeds} / {data.totalCapacity}</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${data.occupancyRate}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{data.paid}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Paid</p>
        </div>
        <div className="card !p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{data.partial}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Partial</p>
        </div>
        <div className="card !p-3 text-center">
          <p className="text-2xl font-bold text-rose-600">{data.unpaid}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Unpaid</p>
        </div>
      </div>
    </div>
  );
}