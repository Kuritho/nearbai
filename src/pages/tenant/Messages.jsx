import { useState, useEffect } from 'react';
import { MessageSquare, Send, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messages, houses } from '../../services/localDB';

export default function Messages() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ houseId: '', subject: '', body: '' });
  const [reply, setReply] = useState('');

  const load = () => setList(messages.listForTenant(user.id));
  useEffect(() => { load(); }, [user.id]);

  const handleSend = (e) => {
    e.preventDefault();
    messages.send({ tenantId: user.id, ...form });
    setShowNew(false);
    setForm({ houseId: '', subject: '', body: '' });
    load();
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    messages.reply(selected.id, { fromRole: 'tenant', body: reply });
    setReply('');
    load();
    setSelected(messages.listForTenant(user.id).find((m) => m.id === selected.id));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-slate-600 text-sm mt-1">Chat with the owner</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> New
        </button>
      </div>

      {showNew ? (
        <div className="card">
          <button onClick={() => setShowNew(false)} className="text-sm text-indigo-600 mb-3 flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="label">Boarding House</label>
              <select className="input" required value={form.houseId} onChange={(e) => setForm({ ...form, houseId: e.target.value })}>
                <option value="">Select house…</option>
                {houses.list().map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><label className="label">Message</label><textarea rows={4} className="input" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <button type="submit" className="btn-primary w-full"><Send size={16} className="mr-2" /> Send</button>
          </form>
        </div>
      ) : selected ? (
        <div className="card">
          <button onClick={() => setSelected(null)} className="text-sm text-indigo-600 mb-3 flex items-center gap-1"><ArrowLeft size={14} /> Back</button>
          <p className="font-bold text-slate-900 mb-1">{selected.subject}</p>
          <p className="text-xs text-slate-500 mb-3">{new Date(selected.createdAt).toLocaleString()}</p>
          <div className="space-y-2 mb-4">
            <div className="bg-indigo-50 rounded-xl p-3 max-w-md">
              <p className="text-xs font-bold text-indigo-700 mb-1">You</p>
              <p className="text-sm">{selected.body}</p>
            </div>
            {selected.replies?.map((r, i) => (
              <div key={i} className={`rounded-xl p-3 max-w-md ${r.fromRole === 'admin' ? 'bg-slate-50 ml-auto' : 'bg-indigo-50'}`}>
                <p className="text-xs font-bold text-slate-600 mb-1 capitalize">{r.fromRole}</p>
                <p className="text-sm">{r.body}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleReply} className="flex gap-2">
            <input className="input flex-1" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" />
            <button type="submit" className="btn-primary !px-4 !py-2 !min-h-0"><Send size={16} /></button>
          </form>
        </div>
      ) : list.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-bold mb-1">No messages</p>
          <p className="text-sm text-slate-500">Start a conversation with an owner.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)} className="w-full text-left card !p-4 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-900 text-sm truncate">{m.subject}</p>
                {m.status === 'unread' && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
              </div>
              <p className="text-xs text-slate-500 truncate mt-1">{m.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}