import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

export default function StatCard({ icon: Icon, label, value, color = 'indigo', prefix }) {
  const themes = {
    indigo:  { stripe: 'bg-indigo-500',  icon: 'bg-indigo-50 text-indigo-600',   ring: 'ring-indigo-100' },
    emerald: { stripe: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-100' },
    amber:   { stripe: 'bg-amber-500',   icon: 'bg-amber-50 text-amber-600',     ring: 'ring-amber-100' },
    rose:    { stripe: 'bg-rose-500',    icon: 'bg-rose-50 text-rose-600',       ring: 'ring-rose-100' },
    sky:     { stripe: 'bg-sky-500',     icon: 'bg-sky-50 text-sky-600',         ring: 'ring-sky-100' },
    violet:  { stripe: 'bg-violet-500',  icon: 'bg-violet-50 text-violet-600',   ring: 'ring-violet-100' },
  };
  const t = themes[color] || themes.indigo;

  const numericValue =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
  const isNum = !isNaN(numericValue) && String(value).match(/^[₱\d,.\s]*$/);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative bg-white rounded-3xl border border-slate-100 p-4 overflow-hidden"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.03), 0 8px 24px -12px rgba(15,23,42,0.08)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${t.stripe}`} />
      <div className={`inline-flex p-2.5 rounded-xl ${t.icon} mb-3`}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
        {isNum ? (
          <>
            {prefix}
            <AnimatedNumber value={numericValue} />
          </>
        ) : (
          value
        )}
      </p>
    </motion.div>
  );
}