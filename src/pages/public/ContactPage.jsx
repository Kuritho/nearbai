import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import PublicNavbar from './PublicNavbar';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <PublicNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">Contact Us</h1>
          <p className="text-slate-600">Questions? We'd love to hear from you.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: Mail, label: 'Email', value: 'hello@nearbai.ph' },
            { icon: Phone, label: 'Phone', value: '+63 917 123 4567' },
            { icon: MapPin, label: 'Location', value: 'Cebu, Philippines' },
          ].map((c) => (
            <div key={c.label} className="card text-center">
              <c.icon size={22} className="text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500 uppercase">{c.label}</p>
              <p className="font-semibold text-slate-900 text-sm mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="card text-center py-12">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-900 text-xl mb-1">Message sent!</p>
            <p className="text-sm text-slate-500">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-3 max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><label className="label">Message</label><textarea rows={5} className="input" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <button type="submit" className="btn-primary w-full"><Send size={16} className="mr-2" /> Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}