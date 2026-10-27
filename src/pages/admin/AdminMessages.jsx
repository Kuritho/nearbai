import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Search, ArrowLeft } from 'lucide-react';
import { houses, messages } from '../../services/localDB';
import { useToast } from '../../components/Toast';

export default function AdminMessages() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const load = () => {
    const current = houses.current();
    if (current) setList(messages.listForHouse(current.id));
  };

  useEffect(() => { load(); }, []);

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      messages.reply(selected.id, { fromRole: 'admin', body: reply });
      toast('Reply sent', 'success');
      setReply('');
      load();
      // Update the selected message view
      setSelected((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), { fromRole: 'admin', body: reply, at: new Date().toISOString() }],
        status: 'replied'
      }));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const filtered = list.filter((m) =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-600 text-sm mt-1">Inquiries from your tenants</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Column: Message List */}
        <div className="lg:col-span-1 card !p-0 flex flex-col overflow-hidden h-full">
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No messages found.</p>
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left p-4 border-b border-slate-50 transition hover:bg-slate-50 ${
                    selected?.id === m.id ? 'bg-indigo-50 border-indigo-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-900 text-sm truncate pr-2">
                      {m.tenantName}
                    </p>
                    {m.status === 'unread' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 truncate mb-0.5">{m.subject}</p>
                  <p className="text-xs text-slate-500 truncate">{m.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Conversation View */}
        <div className="lg:col-span-2 card !p-0 flex flex-col overflow-hidden h-full">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900">{selected.subject}</h3>
                  <p className="text-xs text-slate-500">
                    From: <strong>{selected.tenantName}</strong> ({selected.tenantEmail})
                  </p>
                </div>
                {selected.status === 'replied' && (
                  <span className="chip-emerald"><CheckCircle2 size={12} /> Replied</span>
                )}
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafaf9]">
                {/* Original Message */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {selected.tenantName[0]?.toUpperCase()}
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-slate-200 max-w-[85%] shadow-sm">
                    <p className="text-xs font-bold text-slate-700 mb-1">{selected.tenantName}</p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{selected.body}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Replies */}
                {selected.replies?.map((r, i) => {
                  const isAdmin = r.fromRole === 'admin';
                  return (
                    <div key={i} className={`flex gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        isAdmin ? 'bg-indigo-500' : 'bg-slate-500'
                      }`}>
                        {isAdmin ? 'A' : selected.tenantName[0]?.toUpperCase()}
                      </div>
                      <div className={`rounded-2xl p-3 max-w-[85%] shadow-sm ${
                        isAdmin 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 rounded-tl-none'
                      }`}>
                        <p className={`text-xs font-bold mb-1 ${isAdmin ? 'text-indigo-100' : 'text-slate-700'}`}>
                          {isAdmin ? 'You (Admin)' : selected.tenantName}
                        </p>
                        <p className={`text-sm whitespace-pre-wrap ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                          {r.body}
                        </p>
                        <p className={`text-[10px] mt-2 ${isAdmin ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(r.at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <div className="p-3 border-t border-slate-100 bg-white shrink-0">
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    className="input flex-1 text-sm bg-slate-50"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <button type="submit" disabled={sending || !reply.trim()} className="btn-primary !px-4 !py-0">
                    {sending ? 'Sending…' : <Send size={18} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
              <MessageSquare size={48} className="text-slate-200 mb-3" />
              <p className="text-slate-500 font-semibold">No message selected</p>
              <p className="text-xs text-slate-400">Choose a conversation from the left to read and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}