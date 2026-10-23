export default function BedPicker({ totalBeds, takenBeds = [], selected, onSelect }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Pick a bed ({totalBeds} beds total)
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: totalBeds }, (_, i) => i + 1).map((n) => {
          const isTaken = takenBeds.includes(n);
          const isSelected = selected === n;
          return (
            <button
              key={n}
              disabled={isTaken}
              onClick={() => onSelect(n)}
              className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition ${
                isTaken
                  ? 'bg-rose-50 border-rose-200 cursor-not-allowed'
                  : isSelected
                  ? 'bg-orange-100 border-orange-400 ring-4 ring-orange-100'
                  : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              <span className="text-2xl mb-0.5">
                {isTaken ? '🚫' : isSelected ? '🛏️' : '🛌'}
              </span>
              <span
                className={`text-xs font-bold ${
                  isTaken ? 'text-rose-700' : isSelected ? 'text-orange-700' : 'text-emerald-700'
                }`}
              >
                Bed {n}
              </span>
              {isTaken && (
                <span className="text-[9px] text-rose-600 font-bold uppercase">Taken</span>
              )}
              {isSelected && (
                <span className="text-[9px] text-orange-600 font-bold uppercase">Selected</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] font-semibold text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Available
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-rose-100 border border-rose-300" /> Taken
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-100 border border-orange-400" /> Selected
        </div>
      </div>
    </div>
  );
}