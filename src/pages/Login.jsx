import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const user = await login(email, password);
      const target =
        user.role === 'admin' ? '/admin'
        : user.role === 'caretaker' ? '/caretaker'
        : '/tenant';
      navigate(target);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT — Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 p-12 flex-col justify-between text-white">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-pink-400/20 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <Logo size={48} showWordmark />
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold leading-tight tracking-tight mb-4"
          >
            Your nearby boarding house manager.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-lg leading-relaxed"
          >
            Manage rooms, tenants, rent, and expenses — all in one clean, mobile-first platform built for Philippine properties.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3 mt-8"
          >
            {[
              // { n: '₱', l: 'PHP Pricing' },
              // { n: '3', l: 'User Roles' },
              { n: '24/7', l: 'Access' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-3">
                <p className="text-2xl font-extrabold">{s.n}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold mt-0.5">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © 2026 NearBai · Made for Filipino landlords
        </p>
      </div>

      {/* RIGHT — Form */}
      <div className="flex items-center justify-center p-6 bg-[#fafaf9] bg-noise">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size={56} showWordmark />
          </div>

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
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-indigo-500" />
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Demo Access
                </p>
              </div>
              <p className="text-xs text-slate-700 font-mono">admin@nearbai.ph</p>
              <p className="text-xs text-slate-700 font-mono">Admin123!</p>
            </div>
          </div>

          {/* Reserve CTA */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs mb-3">Don't have an account?</p>
            <button
              onClick={() => navigate('/reserve')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              Reserve a bed <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}