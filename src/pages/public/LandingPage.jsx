import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Search, MapPin, Shield, Wallet, Users, ArrowRight,
  Sparkles,
} from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import Logo from '../../components/Logo';
import { houses, rooms, tenants } from '../../services/localDB';

export default function LandingPage() {
  const allHouses = houses.list();

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <PublicNavbar />

      {/* HERO — with background + person PNG */}
      <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px] lg:min-h-[750px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/90 via-[#a855f7]/75 to-[#ec4899]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-pink-400/20 blur-3xl" />

        {/* PERSON PNG */}
        <motion.img
          src="/hero-person.png"
          alt=""
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute pointer-events-none select-none right-0 bottom-0 h-[70%] sm:h-[85%] lg:h-[95%] max-h-[85vh] object-contain object-bottom drop-shadow-2xl z-[5]"
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl lg:max-w-[55%]"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-white">
              <Sparkles size={12} /> Find your home away from home
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 text-white drop-shadow-lg">
              Looking for a<br />
              boarding house,
              <span className="block mt-2 inline-block bg-white px-3 py-1 rounded-2xl shadow-2xl">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Near<span className="text-[#e11d48]">Bai</span>?
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl leading-relaxed drop-shadow">
              Search safe, affordable, and comfortable boarding houses near your school or workplace. Book a bed in just a few clicks.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
              >
                BOOK NOW <ArrowRight size={18} />
              </Link>
              <Link
                to="/signup"
                className="bg-white/15 backdrop-blur border border-white/30 text-white font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2 hover:bg-white/20 transition"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#fafaf9] to-transparent z-[6]" />
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 grid grid-cols-3 gap-4">
          {[
            { n: allHouses.length, l: 'Boarding Houses', icon: Building2 },
            { n: rooms.list().length, l: 'Rooms Available', icon: Shield },
            { n: tenants.list().length, l: 'Happy Tenants', icon: Users },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <s.icon size={20} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{s.n}+</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Why choose NearBai?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Finding a boarding house should be simple and hassle-free.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Search, title: 'Smart Search', desc: 'Filter by location, budget, gender, and availability.', color: 'from-indigo-500 to-violet-600' },
            { icon: MapPin, title: 'Near You', desc: 'Find houses close to your school or workplace.', color: 'from-emerald-500 to-teal-600' },
            { icon: Shield, title: 'Safe & Verified', desc: 'Reviewed boarding houses from verified owners.', color: 'from-amber-500 to-orange-600' },
            { icon: Wallet, title: 'Flexible Payment', desc: 'Pay via Cash, GCash, or Bank Transfer.', color: 'from-rose-500 to-pink-600' },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg mb-3`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED HOUSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Houses</h2>
            <p className="text-slate-600 text-sm mt-1">Browse our latest boarding houses</p>
          </div>
          <Link to="/browse" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {allHouses.length === 0 ? (
          <div className="card text-center py-12">
            <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No houses listed yet</p>
            <p className="text-sm text-slate-500">Check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allHouses.slice(0, 3).map((h) => {
              const hRooms = rooms.list(h.id);
              const totalBeds = hRooms.reduce((s, r) => s + r.bedCapacity, 0);
              const occupied = tenants.list(h.id).filter((t) => t.status === 'occupied').length;
              const minRate = hRooms.length ? Math.min(...hRooms.map((r) => r.monthlyRate)) : 0;
              const coverImg = h.imageUrl || hRooms.find((r) => r.imageUrl)?.imageUrl || '';

              return (
                <Link key={h.id} to={`/browse/${h.id}`} className="card-hover block overflow-hidden !p-0">
                  <div className="aspect-video overflow-hidden bg-slate-100 relative">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={h.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Building2 size={40} className="text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-bold text-slate-800">
                      {Math.max(0, totalBeds - occupied)} beds open
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-1 truncate">{h.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin size={11} /> {h.address || 'Location not set'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-indigo-600">
                        {minRate > 0 ? `₱${minRate.toLocaleString('en-PH')}/mo` : 'No rate'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              Ready to find your boarding house?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Create a free account to book beds, save favorites, and message owners directly.
            </p>
            <Link to="/signup" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow-2xl hover:bg-slate-50 active:scale-95 transition">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={36} showWordmark />
            <div className="flex gap-4 text-sm text-slate-500">
              <Link to="/browse" className="hover:text-slate-900">Browse</Link>
              <Link to="/about" className="hover:text-slate-900">About</Link>
              <Link to="/contact" className="hover:text-slate-900">Contact</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">© 2026 NearBai · Made for Filipino landlords</p>
        </div>
      </footer>
    </div>
  );
}