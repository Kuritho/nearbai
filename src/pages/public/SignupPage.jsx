import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Phone, ArrowRight, Loader2, ArrowLeft,
  ShieldCheck, Users, Building2,
} from 'lucide-react';
import Logo from '../../components/Logo';
import { tenants, auth } from '../../services/localDB';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      tenants.create({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        emergencyContact: '',
        roomId: null,
        moveInDate: null,
      });
      auth.login(form.email, form.password);
      navigate('/tenant');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            Create your free account.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 text-lg leading-relaxed mb-8 drop-shadow"
          >
            Book beds, save favorites, message owners, and track your rent — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: Building2, n: 'Browse', l: 'Houses' },
              { icon: Users, n: 'Book', l: 'Beds' },
              { icon: ShieldCheck, n: 'Secure', l: 'Payments' },
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

      {/* ─── RIGHT: Signup Form ─── */}
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
                Get Started
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Sign up
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Create your NearBai tenant account.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    className="input pl-11"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    className="input pl-11"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    className="input pl-11"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09171234567"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    className="input pl-11"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !mt-6">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Creating...</> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}