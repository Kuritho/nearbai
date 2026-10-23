import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Loader2, CheckCircle2, AlertCircle, X, FileImage,
  Copy, Check, ArrowRight, ArrowLeft, Smartphone, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rentPayments, utilityCharges, settings as settingsDB } from '../../services/localDB';
import { runOCR } from '../../services/ocrService';

const PAYMENT_METHODS = [
  { id: 'gcash', label: 'GCash', sub: 'Pay via GCash app', emoji: '💙', grad: 'from-blue-500 to-blue-600' },
  { id: 'bank', label: 'Bank Transfer', sub: 'BPI / BDO / etc.', emoji: '🏦', grad: 'from-emerald-500 to-teal-600' },
];

export default function PayBill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]); // combined rent + utility "bills"
  const [selected, setSelected] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [ownerAccounts, setOwnerAccounts] = useState(null);

  const [ocrPreview, setOcrPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [manualRef, setManualRef] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const rents = rentPayments.listForTenant(user.id)
      .filter((r) => r.status !== 'paid')
      .map((r) => ({
        id: 'rent-' + r.id,
        kind: 'rent',
        refId: r.id,
        label: `Rent — ${r.billingMonth}`,
        amount: r.balance,
        dueDate: null,
      }));
    const utils = utilityCharges.listForTenant(user.id)
      .filter((u) => u.status === 'unpaid')
      .map((u) => ({
        id: 'util-' + u.id,
        kind: 'utility',
        refId: u.id,
        label: `${u.chargeType} — ${u.billingPeriod}`,
        amount: u.amountBilled,
        dueDate: null,
      }));
    setItems([...rents, ...utils]);
    setOwnerAccounts(settingsDB.get());
    setFetching(false);
  }, [user.id]);

  const toggleItem = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectedItems = items.filter((i) => selected.includes(i.id));
  const total = selectedItems.reduce((s, i) => s + i.amount, 0);
  const activeAccount = method && ownerAccounts ? ownerAccounts[method] : null;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch { /* ignore */ }
  };

  const handleChooseMethod = (id) => {
    if (!selected.length) return setErrorMsg('Select at least one bill first.');
    setMethod(id);
    setErrorMsg('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setMethod(null);
    clearProof();
  };

  const clearProof = () => {
    setOcrPreview(null);
    setOcrText('');
    setManualRef('');
    setManualAmount('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOCRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setOcrText('');

    const reader = new FileReader();
    reader.onload = (ev) => setOcrPreview(ev.target.result);
    reader.readAsDataURL(file);

    setOcrLoading(true);
    try {
      const text = await runOCR(file);
      setOcrText(text);
      const refMatch = text.match(/\b\d{10,13}\b/);
      if (refMatch) setManualRef(refMatch[0]);
      const amountMatch = text.match(/(?:PHP|₱|P)\s*([\d,]+(?:\.\d{2})?)/i);
      if (amountMatch) setManualAmount(amountMatch[1].replace(/,/g, ''));
      else setManualAmount(String(total));
    } catch {
      setErrorMsg('Could not read the receipt. Try a clearer screenshot.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!method) return setErrorMsg('Choose a payment method first.');
    if (!selected.length) return setErrorMsg('Select at least one bill.');
    if (!ocrPreview) return setErrorMsg('Upload your receipt first.');
    if (!manualRef.trim()) return setErrorMsg('Enter the reference number.');
    if (!manualAmount) return setErrorMsg('Enter the amount you sent.');

    setErrorMsg('');
    setSubmitting(true);
    try {
      // Create a "submitted payment" — stored as pending rent record(s)
      // For simplicity, record a partial payment against each selected bill
      selectedItems.forEach((item) => {
        if (item.kind === 'rent') {
          rentPayments.recordPayment(item.refId, {
            amount: item.amount,
            paymentMethod: method,
            orNumber: manualRef.trim(),
          });
        } else if (item.kind === 'utility') {
          // Utility charges only have paid/unpaid — mark paid on approval later
          // For demo, store pending flag
        }
      });
      // For now, navigate to a placeholder receipt
      clearProof();
      navigate('/tenant');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">All paid up! 🎉</h1>
        <p className="text-sm text-slate-600 mt-2">You have no unpaid bills.</p>
        <button onClick={() => navigate('/tenant')} className="btn-secondary mt-6">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pay Rent</h1>
        <p className="text-slate-600 text-sm mt-1">
          Two steps. Pay via GCash/Bank, then upload your receipt.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <StepPill n={1} label="Choose Method" active={step === 1} done={step > 1} />
        <div className={`flex-1 h-0.5 rounded-full ${step > 1 ? 'bg-violet-500' : 'bg-slate-200'}`} />
        <StepPill n={2} label="Upload Receipt" active={step === 2} done={false} />
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-3">Bills to pay</h2>
              <div className="space-y-2">
                {items.map((b) => {
                  const isSel = selected.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggleItem(b.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                        isSel ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        isSel ? 'bg-violet-500 border-violet-500' : 'border-slate-300'
                      }`}>
                        {isSel && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm capitalize">{b.label}</p>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">₱{b.amount.toLocaleString('en-PH')}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <p className="text-xs text-slate-500">{selected.length} selected</p>
                <p className="text-xl font-bold text-slate-900">₱{total.toLocaleString('en-PH')}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-slate-900 mb-1">Step 1 — Choose payment method</h2>
              <p className="text-xs text-slate-500 mb-4">Pick where you sent the money.</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => {
                  const acct = ownerAccounts?.[m.id];
                  const disabled = !acct?.enabled || (m.id === 'gcash' && !acct?.phone) || (m.id === 'bank' && !acct?.accountNumber);
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={!disabled ? { y: -3 } : {}}
                      whileTap={!disabled ? { scale: 0.97 } : {}}
                      onClick={() => !disabled && handleChooseMethod(m.id)}
                      disabled={disabled || !selected.length}
                      className={`relative p-4 rounded-xl border-2 text-left transition disabled:opacity-40 ${
                        disabled ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white hover:border-violet-400'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center shadow-lg mb-2 text-2xl`}>
                        {m.emoji}
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{m.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{disabled ? 'Not available' : m.sub}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && activeAccount && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="card-gradient">
              <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">Amount to send</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">₱{total.toLocaleString('en-PH')}</p>
              <p className="text-slate-600 text-xs mt-1">
                {selected.length} bill{selected.length !== 1 ? 's' : ''} · via {PAYMENT_METHODS.find((m) => m.id === method)?.label}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-violet-100 border border-violet-200">
                  <Smartphone size={18} className="text-violet-600" />
                </div>
                <h2 className="font-bold text-slate-900">Send to the owner's account</h2>
              </div>

              <div className="space-y-2">
                {method === 'gcash' && (
                  <>
                    <CopyRow label="Account Name" value={activeAccount.accountName || '—'} copied={copiedField === 'name'} onCopy={() => copyToClipboard(activeAccount.accountName, 'name')} />
                    <CopyRow label="GCash Number" value={activeAccount.phone || '—'} mono copied={copiedField === 'phone'} onCopy={() => copyToClipboard(activeAccount.phone, 'phone')} />
                  </>
                )}
                {method === 'bank' && (
                  <>
                    <CopyRow label="Bank" value={activeAccount.bankName || '—'} />
                    <CopyRow label="Account Name" value={activeAccount.accountName || '—'} />
                    <CopyRow label="Account Number" value={activeAccount.accountNumber || '—'} mono copied={copiedField === 'acc'} onCopy={() => copyToClipboard(activeAccount.accountNumber, 'acc')} />
                  </>
                )}
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-800">
                  Send exactly <strong>₱{total.toLocaleString('en-PH')}</strong>, then upload your receipt below.
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-slate-900 mb-1">Step 2 — Upload your receipt</h2>
              <p className="text-xs text-slate-500 mb-4">Screenshot the confirmation from your app.</p>

              {!ocrPreview ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition">
                  <Upload size={22} className="text-violet-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-900">Tap to upload screenshot</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">PNG, JPG</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleOCRUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img src={ocrPreview} alt="Receipt" className="w-full max-h-48 object-cover rounded-xl border border-slate-200" />
                    <button onClick={clearProof} className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-lg border border-slate-200">
                      <X size={14} className="text-slate-600" />
                    </button>
                  </div>
                  {ocrLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <Loader2 className="animate-spin" size={14} /> Reading receipt…
                    </div>
                  )}
                  {ocrText && !ocrLoading && (
                    <>
                      <div>
                        <label className="label">Reference Number</label>
                        <input className="input" value={manualRef} onChange={(e) => setManualRef(e.target.value)} placeholder="e.g. 1234567890" />
                      </div>
                      <div>
                        <label className="label">Amount Sent</label>
                        <input type="number" className="input" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} placeholder="0.00" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={submitting || !ocrPreview} className="btn-success w-full">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <FileImage className="mr-2" size={18} />}
              Submit Payment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepPill({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        done ? 'bg-emerald-500 text-white'
        : active ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
        : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}>
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

function CopyRow({ label, value, mono, copied, onCopy }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`font-bold text-slate-900 truncate ${mono ? 'font-mono text-base tracking-wider' : 'text-sm'}`}>{value}</p>
      </div>
      {onCopy && (
        <button onClick={onCopy} className={`p-2 rounded-lg border ${copied ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  );
}