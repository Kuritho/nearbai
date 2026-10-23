import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function PoliciesModal({ isOpen, onClose, onAccept, houseName }) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const policies = [
    'Rent is due on the 5th of every month. Late payments incur a ₱200 penalty.',
    'A one-month advance and one-month deposit are required upon move-in.',
    'No smoking, no illegal substances, and no unauthorized overnight guests.',
    'Quiet hours: 10:00 PM – 6:00 AM. Please respect other tenants.',
    'Utilities (electricity, water) are sub-metered and billed monthly.',
    'Any damages to property will be charged to the tenant.',
    'Cancellation of a confirmed booking is subject to a 50% deposit forfeit.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-lg text-slate-900">Boarding House Policies</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-4">
            Before booking a bed at <strong>{houseName}</strong>, please read and agree to the following policies:
          </p>
          <ol className="space-y-2 mb-6">
            {policies.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-5 h-5 accent-indigo-600 mt-0.5"
            />
            <span className="text-sm font-semibold text-slate-700">
              I have read and agree to all the boarding house policies above.
            </span>
          </label>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-2 shrink-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => { onAccept(); onClose(); }}
            disabled={!checked}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            <CheckCircle2 size={16} className="mr-2" /> Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}