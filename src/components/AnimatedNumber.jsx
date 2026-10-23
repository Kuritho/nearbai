import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

export default function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1 }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [numericValue, duration]);

  const formatted = display.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}