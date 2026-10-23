export default function Logo({ size = 40, showWordmark = false }) {
  return (
    <div className="flex items-center gap-2.5">
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
          d="M32 14c-7.2 0-13 5.8-13 13 0 9.2 10.4 18.5 12.3 20a1.1 1.1 0 001.4 0c1.9-1.5 12.3-10.8 12.3-20 0-7.2-5.8-13-13-13z"
          fill="white"
          opacity="0.1"
        />
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