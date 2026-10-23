import { motion } from 'framer-motion';

export default function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-auto max-w-md mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bldgDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="roofDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
        <linearGradient id="groundDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="sunDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="glowDark">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Backdrop glow */}
      <circle cx="250" cy="250" r="220" fill="url(#glowDark)" />

      {/* Sun / moon */}
      <motion.circle
        cx="380"
        cy="120"
        r="35"
        fill="url(#sunDark)"
        opacity="0.9"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="380"
        cy="120"
        r="50"
        fill="#fbbf24"
        opacity="0.15"
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.05, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Clouds */}
      <motion.g
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        opacity="0.15"
      >
        <ellipse cx="120" cy="100" rx="35" ry="15" fill="#fff" />
        <ellipse cx="145" cy="95" rx="25" ry="12" fill="#fff" />
      </motion.g>

      <motion.g
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        opacity="0.1"
      >
        <ellipse cx="280" cy="150" rx="25" ry="10" fill="#fff" />
        <ellipse cx="298" cy="146" rx="18" ry="9" fill="#fff" />
      </motion.g>

      {/* Ground glow */}
      <ellipse cx="250" cy="430" rx="200" ry="30" fill="url(#groundDark)" opacity="0.15" />

      {/* Building */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <rect x="130" y="220" width="240" height="200" rx="12" fill="url(#bldgDark)" />
        <path
          d="M110 230 L250 140 L390 230 Z"
          fill="url(#roofDark)"
          stroke="#a21caf"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <rect x="330" y="160" width="30" height="55" rx="4" fill="#c026d3" />
        <rect x="328" y="155" width="34" height="10" rx="3" fill="#a21caf" />

        <motion.g
          animate={{ y: [-5, -25, -5], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
        >
          <circle cx="345" cy="145" r="7" fill="#64748b" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -30, 0], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
        >
          <circle cx="350" cy="135" r="9" fill="#64748b" />
        </motion.g>

        {/* Door */}
        <rect x="228" y="340" width="44" height="80" rx="6" fill="#6d28d9" />
        <rect x="232" y="344" width="36" height="72" rx="4" fill="#a78bfa" opacity="0.3" />
        <circle cx="262" cy="382" r="3" fill="#fbbf24" />

        {/* Glowing windows */}
        <g>
          <rect x="155" y="260" width="45" height="45" rx="6" fill="#fef3c7" opacity="0.9" stroke="#6d28d9" strokeWidth="3" />
          <line x1="177.5" y1="260" x2="177.5" y2="305" stroke="#6d28d9" strokeWidth="2.5" />
          <line x1="155" y1="282.5" x2="200" y2="282.5" stroke="#6d28d9" strokeWidth="2.5" />

          <rect x="300" y="260" width="45" height="45" rx="6" fill="#fef3c7" opacity="0.9" stroke="#6d28d9" strokeWidth="3" />
          <line x1="322.5" y1="260" x2="322.5" y2="305" stroke="#6d28d9" strokeWidth="2.5" />
          <line x1="300" y1="282.5" x2="345" y2="282.5" stroke="#6d28d9" strokeWidth="2.5" />
        </g>

        <motion.rect
          x="155" y="260" width="45" height="45" rx="6" fill="#fbbf24" opacity="0.4"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.rect
          x="300" y="260" width="45" height="45" rx="6" fill="#fbbf24" opacity="0.4"
          animate={{ opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        />

        <rect x="180" y="330" width="140" height="6" rx="3" fill="#6d28d9" />
        <line x1="195" y1="330" x2="195" y2="350" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
        <line x1="305" y1="330" x2="305" y2="350" stroke="#6d28d9" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Trees */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '80px 380px' }}
      >
        <rect x="76" y="350" width="8" height="50" rx="2" fill="#451a03" />
        <circle cx="80" cy="340" r="30" fill="#059669" />
        <circle cx="65" cy="350" r="20" fill="#10b981" />
        <circle cx="95" cy="350" r="20" fill="#047857" />
      </motion.g>

      <motion.g
        animate={{ rotate: [2, -2, 2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '420px 380px' }}
      >
        <rect x="416" y="360" width="8" height="40" rx="2" fill="#451a03" />
        <circle cx="420" cy="350" r="25" fill="#059669" />
        <circle cx="408" cy="360" r="16" fill="#10b981" />
        <circle cx="432" cy="360" r="16" fill="#047857" />
      </motion.g>

      {/* Waving person */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="405" cy="405" r="11" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
        <path d="M395 440 Q405 415 415 440" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
        <motion.path
          d="M415 425 Q425 415 428 405"
          stroke="#8b5cf6"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: [0, -20, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ transformOrigin: '415px 425px' }}
        />
      </motion.g>

      {/* Flowers */}
      <g>
        <motion.circle
          cx="70" cy="425" r="6" fill="#f472b6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="90" cy="430" r="5" fill="#fbbf24"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2.3, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle
          cx="110" cy="428" r="6" fill="#f472b6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: 0.6 }}
        />
      </g>

      {/* Stars */}
      {[[60, 200], [440, 250], [70, 320], [430, 180]].map(([x, y], i) => (
        <motion.g
          key={i}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        >
          <path
            d={`M${x} ${y - 5} L${x + 1} ${y - 1} L${x + 5} ${y} L${x + 1} ${y + 1} L${x} ${y + 5} L${x - 1} ${y + 1} L${x - 5} ${y} L${x - 1} ${y - 1} Z`}
            fill="#fbbf24"
          />
        </motion.g>
      ))}
    </svg>
  );
}