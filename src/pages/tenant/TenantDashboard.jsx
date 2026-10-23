import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Calendar, ArrowRight, Home, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { rentPayments, utilityCharges, rooms } from '../../services/localDB';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [rents, setRents] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [room, setRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRents(rentPayments.listForTenant(user.id));
    setUtilities(utilityCharges.listForTenant(user.id));

    // Find tenant's room
    const allRooms = rooms.list();
    // The tenant record includes roomId — find it via localStorage scan
    const tenantList = JSON.parse(localStorage.getItem('nb_tenants') || '[]');
    const me = tenantList.find((t) => t.id === user.id);
    if (me?.roomId) setRoom(allRooms.find((r) => r.id === me.roomId));
  }, [user.id]);

  const totalRentDue = rents.reduce((s, r) => s + r.balance, 0);
  const totalUtilDue = utilities.filter((u) => u.status === 'unpaid').reduce((s, u) => s + u.amountBilled, 0);
  const totalDue = totalRentDue + totalUtilDue;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card-gradient mb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm">Welcome back 👋</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-2 text-slate-600 text-sm">
              <Home size={14} />
              <span>Room {room?.roomNumber || '—'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-100 border border-rose-200">
              <Wallet size={14} className="text-rose-600" />
            </div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Total Due</p>
          </div>
          <p className="text-xl font-bold text-slate-900">₱{totalDue.toLocaleString('en-PH')}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-100 border border-amber-200">
              <Calendar size={14} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Unpaid Bills</p>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {rents.filter((r) => r.status !== 'paid').length + utilities.filter((u) => u.status === 'unpaid').length}
          </p>
        </div>
      </div>

      {totalDue > 0 && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/tenant/pay')}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-4 mb-5 flex items-center justify-between text-white shadow-lg"
        >
          <div className="text-left">
            <p className="text-white/90 text-xs font-medium">You have unpaid dues</p>
            <p className="font-bold text-lg">Pay Now</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center">
            <ArrowRight size={20} />
          </div>
        </motion.button>
      )}

      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">Rent History</h2>
        {rents.length === 0 ? (
          <div className="card text-center py-8">
            <Wallet size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No rent records yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rents.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card !p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900 capitalize text-sm">Rent</p>
                    <p className="text-xs text-slate-500">Billing: {r.billingMonth}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paid: ₱{r.amountPaid.toLocaleString('en-PH')}</span>
                  <span className="text-slate-900 font-bold">₱{r.amountDue.toLocaleString('en-PH')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Utility Charges</h2>
        {utilities.length === 0 ? (
          <div className="card text-center py-8">
            <Receipt size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No utility charges</p>
          </div>
        ) : (
          <div className="space-y-2">
            {utilities.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card !p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900 capitalize text-sm">{u.chargeType}</p>
                    <p className="text-xs text-slate-500">{u.billingPeriod}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                <p className="text-lg font-bold text-slate-900">₱{u.amountBilled.toLocaleString('en-PH')}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}