import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Calendar, ArrowRight, Home, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { boarderDashboard, payments as paymentsDB } from '../../services/localDB';

export default function BoarderDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ bills: [], room: null, info: null });
  const [pendingPayments, setPendingPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setData(boarderDashboard.get(user.id));
      const all = paymentsDB.listForAdmin();
      const mine = all.filter(
        (p) => p.boarderId === user.id && p.status === 'pending'
      );
      setPendingPayments(mine);
    } catch { /* noop */ }
  }, [user.id]);

  const unpaid = data.bills.filter((b) => b.status !== 'paid');
  const totalDue = unpaid.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-gradient mb-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-200 text-sm">Welcome back 👋</p>
            <p className="text-white text-2xl font-bold mt-1">
              {data.info?.name || user.name}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-slate-200 text-sm">
              <Home size={14} />
              <span>Room {data.room?.number || '—'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg">
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* Pending alert */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg"
            >
              <Clock size={18} className="text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-100 text-sm">
                {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} awaiting approval
              </p>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Total: ₱{pendingPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}
              </p>
              <button
                onClick={() => navigate(`/boarder/pending/${pendingPayments[0].id}`)}
                className="text-xs font-semibold text-amber-100 hover:text-white underline mt-1.5"
              >
                View status →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30">
              <Wallet size={14} className="text-rose-200" />
            </div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Balance Due</p>
          </div>
          <p className="text-xl font-bold text-white">₱{totalDue.toLocaleString()}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <Calendar size={14} className="text-amber-200" />
            </div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Unpaid Bills</p>
          </div>
          <p className="text-xl font-bold text-white">{unpaid.length}</p>
        </div>
      </div>

      {/* Pay CTA */}
      {unpaid.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/boarder/pay')}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-4 mb-5 flex items-center justify-between text-white shadow-lg shadow-violet-500/25 border border-violet-400/20"
        >
          <div className="text-left">
            <p className="text-white/90 text-xs font-medium">
              You have {unpaid.length} unpaid bill(s)
            </p>
            <p className="font-bold text-lg">Pay Now</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center">
            <ArrowRight size={20} />
          </div>
        </motion.button>
      )}

      {/* Bills */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Your Bills</h2>
        {data.bills.length === 0 ? (
          <div className="card text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Wallet size={24} className="text-emerald-200" />
            </div>
            <p className="text-white font-semibold">No bills yet</p>
            <p className="text-xs text-slate-400 mt-1">You're all clear!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.bills.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card !p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                      <Wallet size={16} className="text-violet-200" />
                    </div>
                    <div>
                      <p className="font-bold text-white capitalize text-sm">{b.type}</p>
                      <p className="text-xs text-slate-400">
                        Due {new Date(b.dueDate).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xl font-bold text-white">₱{b.amount.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}