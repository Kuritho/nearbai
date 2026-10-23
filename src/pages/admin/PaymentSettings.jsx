import { useState, useEffect } from 'react';
import {
  Save, Loader2, Smartphone, Building2, Wallet, Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { settings as settingsDB } from '../../services/localDB';
import { useToast } from '../../components/Toast';

export default function PaymentSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setForm(settingsDB.get());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      settingsDB.update(form);
      toast('Payment settings saved', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  const update = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  return (
    <div className="max-w-3xl pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Payment Settings
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          These details appear to tenants when they pay online.
        </p>
      </div>

      {/* Owner name */}
      <div className="card mb-4">
        <label className="label">Owner Name</label>
        <input
          className="input"
          value={form.ownerName || ''}
          onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          placeholder="e.g. Maria Santos"
        />
        <p className="text-xs text-slate-500 mt-2">
          Shown on receipts and payment confirmation screens.
        </p>
      </div>

      {/* GCash */}
      <AccountSection
        icon={Smartphone}
        title="GCash"
        subtitle="Tenants send payment via GCash number"
        color="from-blue-500 to-blue-600"
        enabled={form.gcash?.enabled ?? false}
        onToggle={(v) => update('gcash', 'enabled', v)}
      >
        <Field
          label="Account Name"
          value={form.gcash?.accountName || ''}
          onChange={(v) => update('gcash', 'accountName', v)}
          placeholder="e.g. Maria Santos"
        />
        <Field
          label="GCash Phone Number"
          value={form.gcash?.phone || ''}
          onChange={(v) => update('gcash', 'phone', v)}
          placeholder="09XX XXX XXXX"
          mono
        />
      </AccountSection>

      {/* Bank Transfer */}
      <AccountSection
        icon={Building2}
        title="Bank Transfer"
        subtitle="BPI, BDO, Metrobank, etc."
        color="from-emerald-500 to-teal-600"
        enabled={form.bank?.enabled ?? false}
        onToggle={(v) => update('bank', 'enabled', v)}
      >
        <Field
          label="Bank Name"
          value={form.bank?.bankName || ''}
          onChange={(v) => update('bank', 'bankName', v)}
          placeholder="e.g. BPI"
        />
        <Field
          label="Account Name"
          value={form.bank?.accountName || ''}
          onChange={(v) => update('bank', 'accountName', v)}
          placeholder="e.g. Maria Santos"
        />
        <Field
          label="Account Number"
          value={form.bank?.accountNumber || ''}
          onChange={(v) => update('bank', 'accountNumber', v)}
          placeholder="e.g. 1234-5678-90"
          mono
        />
      </AccountSection>

      {/* Cash */}
      <AccountSection
        icon={Wallet}
        title="Cash Payment"
        subtitle="Tenants pay in person to the caretaker"
        color="from-violet-500 to-fuchsia-600"
        enabled={form.cash?.enabled ?? false}
        onToggle={(v) => update('cash', 'enabled', v)}
      >
        <Field
          label="Note to Tenant"
          value={form.cash?.note || ''}
          onChange={(v) => update('cash', 'note', v)}
          placeholder="e.g. Pay at the office, Mon–Fri 9am–5pm"
        />
      </AccountSection>

      {/* Save bar */}
      <div className="fixed bottom-20 lg:bottom-6 inset-x-4 lg:left-72 lg:right-8 bg-white/95 backdrop-blur-lg rounded-2xl p-3 shadow-lg border border-slate-200 max-w-3xl mx-auto">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <Save className="mr-2" size={18} />
          )}
          {saving ? 'Saving…' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
}

function AccountSection({ icon: Icon, title, subtitle, color, enabled, onToggle, children }) {
  return (
    <div className="card mb-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-12 h-7 rounded-full transition ${
            enabled ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          aria-label={`Toggle ${title}`}
        >
          <motion.div
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow"
          />
        </button>
      </div>

      <div className={`space-y-3 transition ${enabled ? '' : 'opacity-50 pointer-events-none'}`}>
        {children}
      </div>

      {enabled && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <Check size={12} /> Enabled — tenants can choose this method
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className={`input ${mono ? 'font-mono tracking-wider' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}