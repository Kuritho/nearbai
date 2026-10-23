import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Building2, DoorOpen, ArrowLeft, ArrowRight, Heart, Users,
} from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import BedPicker from './BedPicker';
import PoliciesModal from './PoliciesModal';
import { houses, rooms, bookings, favorites } from '../../services/localDB';
import { useAuth } from '../../context/AuthContext';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [house, setHouse] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [moveIn, setMoveIn] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [showPolicies, setShowPolicies] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = houses.get(id);
    if (!h) {
      navigate('/browse');
      return;
    }
    setHouse(h);
    setRoomList(rooms.list(id));
  }, [id, navigate]);

  const handleBook = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/browse/${id}`));
      return;
    }
    if (!selectedRoom || !selectedBed) {
      return setError('Please select a room and bed first.');
    }
    setShowPolicies(true);
  };

  const confirmBooking = () => {
    try {
      bookings.create({
        tenantId: user.id,
        roomId: selectedRoom.id,
        bedNumber: selectedBed,
        moveInDate: moveIn,
        guestName: user.name,
        guestPhone: '',
      });
      navigate('/tenant/bookings');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleFav = () => {
    if (!user) return;
    favorites.toggle(user.id, id);
    setHouse({ ...house });
  };

  if (!house) return <div className="p-8">Loading…</div>;

  const isFav = user ? favorites.isFavorite(user.id, id) : false;
  const coverImg =
    house.imageUrl ||
    roomList.find((r) => r.imageUrl)?.imageUrl ||
    '';

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/browse"
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={14} /> Back to Browse
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            {/* House cover */}
            <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100">
              {coverImg ? (
                <img
                  src={coverImg}
                  alt={house.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Building2 size={64} className="text-white/80" />
                </div>
              )}
            </div>

            {/* House header */}
            <div className="card">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {house.name}
                </h1>
                {user?.role === 'tenant' && (
                  <button
                    onClick={toggleFav}
                    className={`p-2.5 rounded-xl transition ${
                      isFav
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-rose-50'
                    }`}
                  >
                    <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
              <p className="text-slate-600 flex items-center gap-1.5 mb-1">
                <MapPin size={14} /> {house.address || 'Location not set'}
              </p>
              {house.contactNumber && (
                <p className="text-sm text-slate-500">Contact: {house.contactNumber}</p>
              )}
            </div>

            {/* Rooms */}
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-3">Rooms & Bed Availability</h2>
              {roomList.length === 0 ? (
                <p className="text-sm text-slate-500">No rooms listed yet.</p>
              ) : (
                <div className="space-y-2">
                  {roomList.map((r) => {
                    const taken = bookings.takenBeds(r.id);
                    const available = r.bedCapacity - r.occupants - taken.length;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRoom(r);
                          setSelectedBed(null);
                          setError('');
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                          selectedRoom?.id === r.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {/* Room thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt={`Room ${r.roomNumber}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                              <DoorOpen size={18} className="text-indigo-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm">
                            Room {r.roomNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            ₱{r.monthlyRate.toLocaleString('en-PH')}/mo ·{" "}
                            {available} bed{available !== 1 ? 's' : ''} available
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                            {r.gender === 'mixed' ? 'Mixed dorm' : `${r.gender} only`}
                          </p>
                        </div>
                        {available === 0 && <span className="chip-rose text-xs">Full</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bed picker */}
            {selectedRoom && (
              <div className="card">
                <h2 className="font-bold text-slate-900 mb-3">
                  Select Your Bed in Room {selectedRoom.roomNumber}
                </h2>

                {/* Selected room photo (bigger view) */}
                {selectedRoom.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img
                      src={selectedRoom.imageUrl}
                      alt={`Room ${selectedRoom.roomNumber}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <BedPicker
                  totalBeds={selectedRoom.bedCapacity}
                  takenBeds={bookings.takenBeds(selectedRoom.id)}
                  selected={selectedBed}
                  onSelect={setSelectedBed}
                />
              </div>
            )}
          </div>

          {/* Sidebar booking card */}
          <div>
            <div className="card sticky top-24">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Monthly Rate
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mb-4">
                {selectedRoom
                  ? `₱${selectedRoom.monthlyRate.toLocaleString('en-PH')}`
                  : '—'}
              </p>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs mb-3">
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <label className="label text-[10px]">Move-in Date</label>
                  <input
                    type="date"
                    value={moveIn}
                    onChange={(e) => setMoveIn(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Room</span>
                    <span className="font-semibold">
                      {selectedRoom?.roomNumber || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bed</span>
                    <span className="font-semibold">
                      {selectedBed ? `Bed ${selectedBed}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {user ? (
                <button
                  onClick={handleBook}
                  disabled={!selectedRoom || !selectedBed}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {selectedRoom && selectedBed ? (
                    <>
                      Book Bed {selectedBed} <ArrowRight size={16} />
                    </>
                  ) : (
                    'Select a bed first'
                  )}
                </button>
              ) : (
                <Link to="/signup" className="btn-primary w-full">
                  Sign up to book
                </Link>
              )}

              <p className="text-[11px] text-slate-500 text-center mt-3">
                You won't be charged until the owner approves.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PoliciesModal
        isOpen={showPolicies}
        onClose={() => setShowPolicies(false)}
        onAccept={confirmBooking}
        houseName={house.name}
      />
    </div>
  );
}