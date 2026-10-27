import { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { houses } from '../services/localDB';

export default function PropertySwitcher({ compact = false }) {
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setList(houses.list());
    setCurrent(houses.current());
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (id) => {
    houses.setCurrent(id);
    setCurrent(houses.get(id));
    setOpen(false);
    window.location.reload();
  };

  if (!current) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all ${
          compact ? 'px-3 py-2' : 'px-3 py-2.5'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
          <Building2 size={13} className="text-white" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className={`font-bold text-slate-900 leading-tight truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {current.name}
          </p>
          {!compact && (
            <p className="text-[10px] text-slate-400 font-medium">Switch property</p>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-2 left-0 right-0 min-w-[240px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
          >
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
              Your Properties
            </p>
            {list.map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelect(h.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition text-left ${
                  h.id === current.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 size={11} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{h.name}</p>
                  {h.address && (
                    <p className="text-[10px] text-slate-500 truncate">{h.address}</p>
                  )}
                </div>
                {h.id === current.id && <Check size={13} className="text-indigo-600 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
