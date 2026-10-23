import PublicNavbar from './PublicNavbar';
import { Building2, Heart, MapPin, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Heart size={12} /> About Us
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Find your <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">home away from home</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            NearBai is a convenient, user-friendly online boarding house rental platform built for Filipino students and professionals.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <div className="card">
            <p className="text-base sm:text-lg">
              <strong className="text-slate-900">NearBai</strong> is a convenient and user-friendly online boarding house rental platform designed to help students and individuals find safe, comfortable, and affordable accommodations near their schools and preferred locations. Our platform makes searching for a boarding house easier, faster, and more accessible.
            </p>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                <Building2 size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">The name NearBai</h2>
                <p className="text-base">
                  The name <strong>NearBai</strong> comes from the word <em>"Nearby"</em> and the Bisaya term <em>"Bai,"</em> a friendly way of addressing someone as a friend. Together, they represent our goal of creating a welcoming platform where finding a boarding house feels as easy as asking a friend for help.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shrink-0">
                <MapPin size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Our mission</h2>
                <p className="text-base">
                  At NearBai, we believe that finding a place to stay should be simple and hassle-free. Instead of spending hours visiting different boarding houses, users can easily browse available rooms, compare prices, and explore amenities in just a few clicks. Our mission is to help you find not just a boarding house nearby, but a place you can call your <strong>home away from home</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: MapPin, label: 'Near You', desc: 'Find houses close to your school or work' },
              { icon: Users, label: 'For You', desc: 'Built for Filipino students & workers' },
              { icon: Heart, label: 'With Love', desc: 'Simple, friendly, hassle-free' },
            ].map((v) => (
              <div key={v.label} className="card text-center">
                <v.icon size={24} className="text-indigo-500 mx-auto mb-2" />
                <p className="font-bold text-slate-900">{v.label}</p>
                <p className="text-xs text-slate-500 mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}