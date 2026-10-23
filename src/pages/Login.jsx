import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles,
  ArrowLeft, ShieldCheck, Users, Building2,
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      const target =
        user.role === 'admin' ? '/admin'
        : user.role === 'caretaker' ? '/caretaker'
        : '/tenant';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const loggedIn = await login(email, password);

      if (redirect) {
        navigate(redirect);
        return;
      }
      const target =
        loggedIn.role === 'admin' ? '/admin'
        : loggedIn.role === 'caretaker' ? '/caretaker'
        : '/tenant';
      navigate(target);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = () => {
    setEmail('admin@nearbai.ph');
    setPassword('Admin123!');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafaf9]">
      
      {/* ─── LEFT: Image Hero Panel ─── */}
      <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between text-white">
        {/* 1. Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/hero-bg.jpg')` }}
        />
        
        {/* 2. Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/95 via-[#a855f7]/85 to-[#ec4899]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* 3. Content Top (Logo) */}
        <div className="relative z-10">
          <Link to="/" className="inline-block bg-white rounded-2xl px-4 py-2.5 shadow-2xl">
            <Logo size={40} showWordmark />
          </Link>
        </div>

        {/* 4. Content Middle (Text) */}
        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold leading-tight tracking-tight mb-4 drop-shadow-lg"
          >
            Your nearby boarding house manager.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 text-lg leading-relaxed mb-8 drop-shadow"
          >
            Manage rooms, tenants, rent, and expenses — or find your next home away from home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: Building2, n: 'Houses', l: 'Browse' },
              { icon: Users, n: 'Tenants', l: 'Verified' },
              { icon: ShieldCheck, n: 'Secure', l: 'Platform' },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center"
              >
                <s.icon size={18} className="mx-auto mb-1.5 text-white" />
                <p className="text-sm font-extrabold">{s.n}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/80 font-semibold">
                  {s.l}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 5. Content Bottom (Copyright) */}
        <p className="relative z-10 text-xs text-white/70">
          © 2026 NearBai · Made for Filipino landlords & students
        </p>
      </div>

      {/* ─── RIGHT: Login Form ─── */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <Logo size={56} showWordmark />
            </Link>
          </div>

          {/* Back to home link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
          >
            <ArrowLeft size={13} /> Back to Home
          </Link>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
            <div className="hidden lg:block mb-6">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                Welcome back
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Sign in
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Enter your credentials to access your dashboard.
            </p>

            {redirect && (
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <span>Please sign in to continue to that page.</span>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium animate-shake">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-11 pr-11"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-500" />
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Demo Access
                  </p>
                </div>
                <button
                  type="button"
                  onClick={quickFill}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Autofill →
                </button>
              </div>
              <p className="text-xs text-slate-700 font-mono">admin@nearbai.ph</p>
              <p className="text-xs text-slate-700 font-mono">Admin123!</p>
            </div>
          </div>

          <div className="mt-6 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
                Sign up free
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              Looking for a boarding house?{' '}
              <Link to="/browse" className="font-semibold text-slate-600 hover:text-slate-900">
                Browse houses
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}