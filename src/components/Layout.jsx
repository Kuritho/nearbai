import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileTopBar from './MobileTopBar';

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fafaf9] bg-noise">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <MobileTopBar user={user} />

      <main className="relative lg:ml-64 pt-16 lg:pt-0 pb-32 lg:pb-12 px-4 sm:px-6 lg:p-8">
        <div className="max-w-6xl mx-auto pt-6 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <MobileBottomNav user={user} />
    </div>
  );
}