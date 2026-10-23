import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Loader2, CheckCircle2, AlertCircle, X, FileImage,
  Copy, Check, ArrowRight, ArrowLeft, Smartphone, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  bills as billsDB,
  payments as paymentsDB,
  settings as settingsDB,
} from '../../services/localDB';
import { runOCR } from '../../services/ocrService';

const PAYMENT_METHODS = [
  { id: 'gcash', label: 'GCash', sub: 'Pay with GCash app', emoji: '💙', grad: 'from-blue-500 to-blue-600' },
  { id: 'paymaya', label: 'Maya', sub: 'Pay with Maya app', emoji: '💚', grad: 'from-emerald-500 to-teal-600' },
];

export default function PayBill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [bills, setBills] = useState([]);
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
    const myBills = billsDB.listForBoarder(user.id).filter((b) => b.status !== 'paid');
    setBills(myBills);
    setOwnerAccounts(settingsDB.get());
    setFetching(false);
  }, [user.id]);

  const toggleBill = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectedBills = bills.filter((b) => selected.includes(b.id));
  const total = selectedBills.reduce((s, b) => s + b.amount, 0);
  const activeAccount = method && ownerAccounts ? ownerAccounts[method] : null;

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch { /* ignore */ }
  };

  const handleChooseMethod = (id) => {
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
    setManualRef('');
    setManualAmount('');

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
      const payment = paymentsDB.createManual({
        boarderId: user.id,
        billIds: selected,
        reference: manualRef.trim(),
        amount: Number(manualAmount),
        method,
        ocrText,
        receiptUrl: ocrPreview,
      });
      clearProof();
      setSelected([]);
      navigate(`/boarder/pending/${payment.id}`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-300">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading…
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-200" />
        </div>
        <h1 className="text-2xl font-bold text-white">All paid up! 🎉</h1>
        <p className="text-sm text-slate-300 mt-2">You have no unpaid bills.</p>
        <button onClick={() => navigate('/boarder')} className="btn-secondary mt-6">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Pay Bills</h1>
        <p className="text-slate-300 text-sm mt-1">
          Two easy steps. Pay via GCash/Maya, then upload your receipt.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <StepPill n={1} label="Choose Method" active={step === 1} done={step > 1} />
        <div className={`flex-1 h-0.5 rounded-full ${step > 1 ? 'bg-violet-500' : 'bg-[#2a2a38]'}`} />
        <StepPill n={2} label="Upload Receipt" active={step === 2} done={false} />
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-xl overflow-hidden"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="card">
              <h2 className="font-bold text-white mb-3">Bills to pay</h2>
              <div className="space-y-2">
                {bills.map((b) => {
                  const isSel = selected.includes(b.id);
                  const overdue = new Date(b.dueDate) < new Date();
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggleBill(b.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition active:scale-[0.99] ${
                        isSel
                          ? 'border-violet-500/50 bg-violet-500/10'
                          : 'border-[#2a2a38] bg-[#1a1a24] hover:border-[#3a3a4a]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                          isSel ? 'bg-violet-500 border-violet-500' : 'border-[#3a3a4a]'
                        }`}
                      >
                        {isSel && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-white capitalize text-sm">{b.type}</p>
                          {overdue && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-200 px-1.5 py-0.5 rounded font-bold border border-rose-500/30">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Due {new Date(b.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="font-bold text-white text-sm">₱{b.amount.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-[#2a2a38] flex justify-between items-center">
                <p className="text-xs text-slate-400">{selected.length} selected</p>
                <p className="text-xl font-bold text-white">₱{total.toLocaleString()}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-white mb-1">Step 1 — Choose payment method</h2>
              <p className="text-xs text-slate-400 mb-4">
                Pick where you sent the money. We'll show you the owner's account next.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => {
                  const acct = ownerAccounts?.[m.id];
                  const disabled = !acct?.enabled || !acct?.phone;
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={!disabled ? { y: -3 } : {}}
                      whileTap={!disabled ? { scale: 0.97 } : {}}
                      onClick={() => !disabled && handleChooseMethod(m.id)}
                      disabled={disabled || !selected.length}
                      className={`relative p-4 rounded-xl border-2 text-left transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        disabled
                          ? 'border-[#2a2a38] bg-[#1a1a24]'
                          : 'border-[#2a2a38] bg-[#1a1a24] hover:border-violet-500/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center shadow-lg mb-2 text-2xl`}>
                        {m.emoji}
                      </div>
                      <p className="font-bold text-white text-sm">{m.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {disabled ? 'Not available' : m.sub}
                      </p>
                      {!disabled && (
                        <div className="absolute top-3 right-3">
                          <ArrowRight size={16} className="text-slate-400" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {!selected.length && (
                <p className="text-[11px] text-amber-200 mt-3 flex items-center gap-1">
                  <Info size={12} /> Select at least one bill to continue.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && activeAccount && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-200 hover:text-violet-100"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="card-gradient">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Amount to send</p>
              <p className="text-3xl font-bold text-white mt-1">₱{total.toLocaleString()}</p>
              <p className="text-slate-300 text-xs mt-1">
                {selected.length} bill{selected.length !== 1 ? 's' : ''} · via {PAYMENT_METHODS.find((m) => m.id === method)?.label}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/30">
                  <Smartphone size={18} className="text-violet-200" />
                </div>
                <div>
                  <h2 className="font-bold text-white leading-tight">
                    Send to the owner's {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                  </h2>
                  <p className="text-xs text-slate-400">Open your app and send to:</p>
                </div>
              </div>

              <div className="space-y-2">
                <CopyRow
                  label="Account Name"
                  value={activeAccount.accountName || '—'}
                  copied={copiedField === 'name'}
                  onCopy={() => copyToClipboard(activeAccount.accountName, 'name')}
                />
                <CopyRow
                  label="Phone Number"
                  value={activeAccount.phone || '—'}
                  mono
                  copied={copiedField === 'phone'}
                  onCopy={() => copyToClipboard(activeAccount.phone, 'phone')}
                />
              </div>

              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-amber-200 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-100">
                  Send exactly <strong>₱{total.toLocaleString()}</strong>, then take a screenshot of the success screen and upload it below.
                </p>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-white mb-1">Step 2 — Upload your receipt</h2>
              <p className="text-xs text-slate-400 mb-4">
                Screenshot the confirmation from your {PAYMENT_METHODS.find((m) => m.id === method)?.label} app.
              </p>

              {!ocrPreview ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#3a3a4a] rounded-xl p-8 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition active:scale-[0.99]">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mb-3"
                  >
                    <Upload size={22} className="text-violet-200" />
                  </motion.div>
                  <span className="text-sm font-semibold text-white">Tap to upload screenshot</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG — max 5MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOCRUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={ocrPreview}
                      alt="Receipt"
                      className="w-full max-h-48 object-cover rounded-xl border border-[#2a2a38]"
                    />
                    <button
                      onClick={clearProof}
                      className="absolute top-2 right-2 bg-[#12121a] p-1.5 rounded-full shadow-lg hover:bg-[#1a1a24] border border-[#2a2a38] active:scale-95"
                    >
                      <X size={14} className="text-slate-200" />
                    </button>
                  </div>

                  {ocrLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-[#1a1a24] p-3 rounded-xl border border-[#2a2a38]">
                      <Loader2 className="animate-spin" size={14} /> Reading receipt…
                    </div>
                  )}

                  {ocrText && !ocrLoading && (
                    <>
                      <div>
                        <label className="label">Reference Number</label>
                        <input
                          className="input"
                          value={manualRef}
                          onChange={(e) => setManualRef(e.target.value)}
                          placeholder="e.g. 1234567890"
                        />
                      </div>
                      <div>
                        <label className="label">Amount Sent</label>
                        <input
                          type="number"
                          className="input"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-400 hover:text-slate-200">View extracted text</summary>
                        <pre className="mt-2 bg-[#1a1a24] p-2 rounded-lg text-[10px] max-h-32 overflow-auto whitespace-pre-wrap text-slate-300 border border-[#2a2a38]">
                          {ocrText}
                        </pre>
                      </details>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !ocrPreview}
              className="btn-success w-full"
            >
              {submitting ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <FileImage className="mr-2" size={18} />
              )}
              Submit Payment for Approval
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Your payment will be pending until the admin verifies it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepPill({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
          done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'
            : 'bg-[#1a1a24] text-slate-400 border border-[#2a2a38]'
        }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </div>
      <span
        className={`text-xs font-semibold whitespace-nowrap ${
          active ? 'text-white' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function CopyRow({ label, value, mono, copied, onCopy }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1a1a24] border border-[#2a2a38]">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`font-bold text-white truncate ${mono ? 'font-mono text-base tracking-wider' : 'text-sm'}`}>
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className={`p-2 rounded-lg transition active:scale-95 border ${
          copied
            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
            : 'bg-[#12121a] text-slate-300 hover:text-white border-[#2a2a38] hover:border-[#3a3a4a]'
        }`}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}