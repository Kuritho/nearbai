import { useState, useEffect } from 'react';
import { Plus, Megaphone, Trash2, AlertTriangle, Bell } from 'lucide-react';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { announcements, houses } from '../../services/localDB';

const PRIORITIES = {
  normal: { label: 'Normal', color: 'bg-slate-100 text-slate-700', icon: Bell },
  important: { label: 'Important', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  urgent: { label: 'Urgent', color: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
};

export default function Announcements() {
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    const c = houses.current();
    if (c) setList(announcements.list(c.id));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const c = houses.current();
      if (!c) throw new Error("No active property selected");
      
      announcements.create({ houseId: c.id, ...form });
      toast('Announcement posted', 'success');
      setIsOpen(false);
      setForm({ title: '', body: '', priority: 'normal' });
      load();
    } catch (err) { 
      toast(err.message, 'error'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    announcements.remove(id);
    load();
    toast('Deleted', 'success');
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Announcements</h1>
          <p className="text-slate-600 text-sm mt-1">{list.length} post{list.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="btn-primary !px-4 !py-2.5 !min-h-0 text-sm">
          <Plus size={16} className="mr-1.5" /> New
        </button>
      </div>

      {list.length === 0 ? (
        <div className="card text-center py-12">
          <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-900 font-bold mb-1">No announcements yet</p>
          <p className="text-sm text-slate-500">Post one to notify your tenants.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => {
            const P = PRIORITIES[a.priority] || PRIORITIES.normal;
            return (
              <div key={a.id} className="card !p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip ${P.color}`}>{P.label}</span>
                    <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.body}</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div><label className="label">Message</label><textarea rows={4} className="input" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Posting…' : 'Post'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
