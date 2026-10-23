import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Filter, Heart } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import { houses, rooms, tenants, favorites } from '../../services/localDB';
import { useAuth } from '../../context/AuthContext';

export default function BrowsePage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    budget: 'all',
    gender: 'all',
    availability: 'all',
  });

  useEffect(() => {
    const all = houses.list().map((h) => {
      const hRooms = rooms.list(h.id);
      const totalBeds = hRooms.reduce((s, r) => s + r.bedCapacity, 0);
      const occupied = tenants.list(h.id).filter((t) => t.status === 'occupied').length;
      // Cover image: house's own, else first room's image, else none
      const coverImg = h.imageUrl || hRooms.find((r) => r.imageUrl)?.imageUrl || '';
      return {
        ...h,
        rooms: hRooms,
        totalBeds,
        availableBeds: Math.max(0, totalBeds - occupied),
        minRate: hRooms.length ? Math.min(...hRooms.map((r) => r.monthlyRate)) : 0,
        genders: [...new Set(hRooms.map((r) => r.gender || 'mixed'))],
        coverImg,
      };
    });
    setList(all);
  }, []);

  const locations = useMemo(() => {
    return ['all', ...new Set(list.map((h) => h.address).filter(Boolean))];
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((h) => {
      if (search) {
        const q = search.toLowerCase();
        if (!h.name.toLowerCase().includes(q) && !(h.address || '').toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.location !== 'all' && h.address !== filters.location) return false;
      if (filters.budget !== 'all') {
        const [min, max] = filters.budget.split('-').map(Number);
        if (h.minRate < min || (max && h.minRate > max)) return false;
      }
      if (filters.gender !== 'all' && !h.genders.includes(filters.gender) && !h.genders.includes('mixed')) {
        return false;
      }
      if (filters.availability === 'available' && h.availableBeds === 0) return false;
      return true;
    });
  }, [list, search, filters]);

  const toggleFav = (houseId) => {
    if (!user) return;
    favorites.toggle(user.id, houseId);
    setList((p) => [...p]); // force re-render
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
            Browse Boarding Houses
          </h1>
          <p className="text-slate-600">
            {filtered.length} house{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search & filters */}
        <div className="card mb-6">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location…"
              className="input pl-11"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-slate-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="input text-sm"
            >
              <option value="all">All Locations</option>
              {locations.filter((l) => l !== 'all').map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
              className="input text-sm"
            >
              <option value="all">Any Budget</option>
              <option value="0-2000">Under ₱2,000</option>
              <option value="2000-4000">₱2,000 – ₱4,000</option>
              <option value="4000-6000">₱4,000 – ₱6,000</option>
              <option value="6000-99999">₱6,000+</option>
            </select>

            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="input text-sm"
            >
              <option value="all">Any Gender</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="mixed">Mixed</option>
            </select>

            <select
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              className="input text-sm"
            >
              <option value="all">Any Availability</option>
              <option value="available">Available Only</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Building2 size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold mb-1">No houses match your filters</p>
            <p className="text-sm text-slate-500">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h) => {
              const isFav = user ? favorites.isFavorite(user.id, h.id) : false;
              return (
                <div key={h.id} className="card-hover overflow-hidden !p-0">
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {h.coverImg ? (
                      <img
                        src={h.coverImg}
                        alt={h.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Building2 size={48} className="text-white/80" />
                      </div>
                    )}
                    {user && user.role === 'tenant' && (
                      <button
                        onClick={() => toggleFav(h.id)}
                        className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur transition ${
                          isFav ? 'bg-rose-500 text-white' : 'bg-white/30 text-white hover:bg-white/50'
                        }`}
                      >
                        <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                  <Link to={`/browse/${h.id}`} className="block p-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{h.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <MapPin size={11} /> {h.address || 'Location not set'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600">
                        {h.minRate > 0 ? `₱${h.minRate.toLocaleString('en-PH')}/mo` : 'No rate'}
                      </span>
                      <span className={`text-xs font-bold ${h.availableBeds > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {h.availableBeds > 0 ? `${h.availableBeds} beds open` : 'Full'}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}