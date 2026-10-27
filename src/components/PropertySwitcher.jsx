import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, DoorOpen, Users, Wallet, Receipt,
  TrendingUp, LogOut, Settings, Wrench, Shield, Clock, Megaphone,
  MessageSquare, Heart, // <-- Heart added here
} from 'lucide-react';
import Logo from './Logo';
import PropertySwitcher from './PropertySwitcher';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/properties', icon: Building2, label: 'Properties' },
    { to: '/admin/rooms', icon: DoorOpen, label: 'Rooms' },
    { to: '/admin/tenants', icon: Users, label: 'Tenants' },
    { to: '/admin/reservations', icon: Clock, label: 'Reservations' },
    { to: '/admin/rent', icon: Wallet, label: 'Rent Payments' },import { useState, useEffect, useRef } from 'react';
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
    { to: '/admin/utilities', icon: Receipt, label: 'Utility Charges' },
    { to: '/admin/expenses', icon: Wrench, label: 'Expenses' },
    { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/settings', icon: Settings, label: 'Payment Settings' },
    { to: '/admin/users', icon: Shield, label: 'Manage Users' },
  ];

  const caretakerLinks = [
    { to: '/caretaker', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/caretaker/tenants', icon: Users, label: 'Tenants' },
    { to: '/caretaker/reservations', icon: Clock, label: 'Reservations' },
    { to: '/caretaker/rent', icon: Wallet, label: 'Log Payments' },
  ];

  const tenantLinks = [
    { to: '/tenant', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/tenant/bookings', icon: Clock, label: 'My Bookings' },
    { to: '/tenant/pay', icon: Wallet, label: 'Pay Rent' },
    { to: '/tenant/favorites', icon: Heart, label: 'Favorites' },
    { to: '/tenant/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const links =
    role === 'admin' ? adminLinks
    : role === 'caretaker' ? caretakerLinks
    : tenantLinks;

  const sectionLabel =
    role === 'admin' ? 'Management'
    : role === 'caretaker' ? 'Operations'
    : 'My Account';

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Logo size={42} showWordmark />
      </div>

      {/* Property switcher */}
      {(role === 'admin' || role === 'caretaker') && (
        <div className="px-3 pt-3">
          <PropertySwitcher />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {sectionLabel}
        </p>

        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg transition ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  <Icon size={15} strokeWidth={2.3} />
                </div>
                <span className="flex-1">{label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-indigo-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize font-medium">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition font-semibold"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
