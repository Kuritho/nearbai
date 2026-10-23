import { useState } from 'react';

export default function Logo({ size = 40, showWordmark = false, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  // If image fails to load, fall back to the built-in SVG
  if (!imgFailed) {
    return (
      <img
        src="/logo.jpg"
        alt="NearBai"
        onError={() => setImgFailed(true)}
        className={`object-contain select-none ${className}`}
        style={{
          height: size,
          width: 'auto',
          maxWidth: showWordmark ? 'none' : size * 2.5,
        }}
      />
    );
  }

  // ── Fallback SVG (original design) ──
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="nbGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="64" height="64" rx="18" fill="url(#nbGrad)" />
        <path
          d="M20 32l12-10 12 10v14a2 2 0 01-2 2H22a2 2 0 01-2-2V32z"
          fill="white"
        />
        <path
          d="M26 34.5v9M26 34.5L34 43M34 34.5v9"
          stroke="#a5b4fc"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="18" r="2.4" fill="white" />
      </svg>

      {showWordmark && (
        <div>
          <p className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
            Near<span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">Bai</span>
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Boarding House
          </p>
        </div>
      )}
    </div>
  );
}