import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Copy, Check, Home, Phone, User, Calendar, ArrowLeft, Clock,
} from 'lucide-react';
import { useState } from 'react';
import { reservations } from '../../services/localDB';
import Logo from '../../components/Logo';

export default function ReserveSuccess() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const res = reservations.getByReference(reference);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  if (!res) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <p className="text-slate-700 font-semibold mb-2">Reservation not found</p>
          <button onClick={() => navigate('/reserve')} className="btn-secondary mt-4">
            <ArrowLeft size={16} className="mr-2" /> Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Logo size={40} showWordmark />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
          <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Reservation submitted!</h1>
          <p className="text-sm text-slate-500">The admin will review and confirm your reservation.</p>
        </motion.div>

        <div className="card mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Reference</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-wider flex-1">{res.reference}</p>
            <button
              onClick={copyRef}
              className={`p-2 rounded-xl border-2 transition ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="card mb-4 space-y-2 text-sm">
          <Row icon={User} label="Name" value={res.fullName} />
          <Row icon={Phone} label="Phone" value={res.phone} />
          {res.email && <Row icon={Home} label="Email" value={res.email} />}
          <Row icon={Calendar} label="Move-in" value={res.moveInDate} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-2">
          <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-bold mb-1">What happens next?</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>The admin reviews your request</li>
              <li>You'll be contacted via phone or email</li>
              <li>If approved, you'll receive login credentials</li>
            </ul>
          </div>
        </div>

        <button onClick={() => navigate('/reserve')} className="btn-secondary w-full">
          Reserve another bed
        </button>
      </main>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}