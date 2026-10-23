import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export default function ImageUploader({ value, onChange, label = 'Photo' }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large. Max 2MB (to avoid localStorage overflow).');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result); // base64 data URL
      setLoading(false);
    };
    reader.onerror = () => {
      alert('Could not read file');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="label">{label}</label>

      {value ? (
        // Preview
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-white/95 hover:bg-white p-2 rounded-full shadow-md active:scale-95 transition"
            title="Remove photo"
          >
            <X size={14} className="text-rose-600" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ✓ Photo attached
          </div>
        </div>
      ) : (
        // Upload zone
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
        >
          {loading ? (
            <Loader2 size={22} className="animate-spin text-indigo-500 mx-auto mb-2" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
              <Upload size={20} className="text-indigo-600" />
            </div>
          )}
          <p className="text-sm font-semibold text-slate-700">
            {loading ? 'Reading file…' : 'Click or drag to upload'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG — max 2MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
}