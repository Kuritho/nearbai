import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function MobileTopBar({ user }) {
  const { logout } = useAuth();
  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-[#fafaf9]/90 backdrop-blur-xl border-b border-slate-100">
      <div className="flex items-center justify-between px-4 h-16 gap-2">
        <Logo size={34} showWordmark />
        <button
          onClick={logout}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 active:scale-95 transition shrink-0"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}