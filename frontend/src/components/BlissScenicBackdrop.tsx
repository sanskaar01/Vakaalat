import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const SHIMMER_STARS = Array.from({ length: 58 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 97}%`,
  top: `${(i * 31 + 9) % 93}%`,
  size: i % 6 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5,
  delay: (i % 9) * 0.9,
  repeatDelay: 2.5 + (i % 5) * 1.4,
}));

const SHOOTING_STARS = [
  { id: 1, top: '12%', left: '15%', delay: 0.2, duration: 1.4 },
  { id: 2, top: '22%', left: '62%', delay: 1.8, duration: 1.3 },
  { id: 3, top: '8%', left: '42%', delay: 3.4, duration: 1.5 },
  { id: 4, top: '32%', left: '78%', delay: 5.0, duration: 1.2 },
  { id: 5, top: '18%', left: '25%', delay: 6.7, duration: 1.4 },
];

/**
 * Dual-mode Scenic Desktop Backdrop:
 * - Light Mode: Permanent coconut palm trees & green grass; 10s computing sky, clouds & rotating sun.
 * - Dark Mode: Plain deep blue night sky with real constellation patterns (Orion, Ursa Major,
 *   Cassiopeia, Libra) and occasional shimmering stars; 10s computing shooting stars & nebulae.
 */
export const BlissScenicBackdrop: React.FC = () => {
  const { theme, scenicActive } = useApp();

  if (theme === 'dark') {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#050506]"
        aria-hidden="true"
      >
        {/* Pixelated Minecraft-Style Constellations Layer */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          shapeRendering="crispEdges"
          className="absolute inset-0 h-full w-full opacity-55"
        >
          {/* Ursa Major (Big Dipper) — Top Left */}
          <g stroke="#7fb2ff" strokeWidth="1" strokeOpacity="0.4" fill="#ffffff">
            <polyline points="90,170 155,150 215,175 260,210 250,275 335,285 355,215 260,210" fill="none" />
            {[
              [90, 170], [155, 150], [215, 175], [260, 210], [250, 275], [335, 285], [355, 215],
            ].map(([cx, cy], i) => (
              <rect key={`um-${i}`} x={cx - 3} y={cy - 3} width={i === 0 || i === 6 ? 6 : 5} height={i === 0 || i === 6 ? 6 : 5} />
            ))}
          </g>

          {/* Cassiopeia (W shape) — Top Right */}
          <g stroke="#7fb2ff" strokeWidth="1" strokeOpacity="0.4" fill="#ffffff">
            <polyline points="1130,130 1185,185 1240,145 1295,205 1355,155" fill="none" />
            {[
              [1130, 130], [1185, 185], [1240, 145], [1295, 205], [1355, 155],
            ].map(([cx, cy], i) => (
              <rect key={`cas-${i}`} x={cx - 2.5} y={cy - 2.5} width="5" height="5" />
            ))}
          </g>

          {/* Orion — Bottom Left */}
          <g stroke="#7fb2ff" strokeWidth="1" strokeOpacity="0.38" fill="#ffffff">
            <polyline points="110,560 195,585 165,675 180,680 195,685 120,780 220,765 195,685" fill="none" />
            <line x1="110" y1="560" x2="165" y2="675" />
            <line x1="195" y1="585" x2="195" y2="685" />
            {[
              [110, 560], [195, 585], [165, 675], [180, 680], [195, 685], [120, 780], [220, 765],
            ].map(([cx, cy], i) => (
              <rect key={`ori-${i}`} x={cx - 3} y={cy - 3} width={i === 0 || i === 6 ? 6 : 5} height={i === 0 || i === 6 ? 6 : 5} />
            ))}
          </g>

          {/* Libra (The Scales of Justice!) — Bottom Right */}
          <g stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.45" fill="#fef08a">
            <polyline points="1220,540 1150,625 1215,715 1295,660 1220,540" fill="none" />
            <line x1="1150" y1="625" x2="1115" y2="700" />
            <line x1="1295" y1="660" x2="1335" y2="735" />
            {[
              [1220, 540], [1150, 625], [1215, 715], [1295, 660], [1115, 700], [1335, 735],
            ].map(([cx, cy], i) => (
              <rect key={`lib-${i}`} x={cx - 3} y={cy - 3} width={i === 0 ? 6 : 5} height={i === 0 ? 6 : 5} />
            ))}
          </g>
        </svg>

        {/* Minecraft-Style Square Pixel Stars (Zero-lag CSS GPU Shimmer) */}
        {SHIMMER_STARS.map((star) => {
          const pxSize = star.size >= 3 ? 4 : star.size >= 2 ? 3 : 2;
          return (
            <span
              key={star.id}
              className="pixel-star"
              style={
                {
                  left: star.left,
                  top: star.top,
                  width: pxSize,
                  height: pxSize,
                  '--star-dur': `${3.2 + star.repeatDelay}s`,
                  '--star-delay': `${star.delay}s`,
                } as React.CSSProperties
              }
            />
          );
        })}

        {/* Shooting Pixel Stars & Cosmic Nebulae (Active during 10s prompt computation) */}
        <AnimatePresence>
          {scenicActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.45, 0.28] }}
                transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
                className="absolute -left-24 top-12 h-[420px] w-[420px] rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.18) 55%, transparent 75%)',
                }}
              />
              <motion.div
                animate={{ scale: [1.05, 0.96, 1.05], opacity: [0.25, 0.42, 0.25] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                className="absolute -right-24 bottom-10 h-[460px] w-[460px] rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(20, 184, 166, 0.32) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 75%)',
                }}
              />

              {SHOOTING_STARS.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: 340, y: 190, opacity: [0, 1, 1, 0] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 2.4,
                    duration: s.duration,
                    delay: s.delay,
                    ease: 'easeOut',
                  }}
                  className="absolute h-[3px] w-24 -rotate-[28deg]"
                  style={{
                    top: s.top,
                    left: s.left,
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 55%, #ffffff 100%)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.9)',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // LIGHT MODE: Permanent Coconut Palm Trees & Green Grass + 10s Computing Sky/Clouds/Sun
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <AnimatePresence>
        {scenicActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(135, 206, 250, 0.42) 0%, rgba(196, 232, 255, 0.22) 48%, rgba(235, 245, 224, 0.1) 80%, transparent 100%)',
              }}
            />

            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 360 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 },
                rotate: { repeat: Infinity, duration: 9, ease: 'linear' },
              }}
              className="absolute right-8 top-20 h-24 w-24 sm:right-14 sm:top-24 sm:h-28 sm:w-28"
            >
              <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-[0_0_18px_rgba(255,204,51,0.7)]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect
                    key={i}
                    x="57"
                    y="4"
                    width="6"
                    height="18"
                    rx="2"
                    fill="#FFB800"
                    transform={`rotate(${i * 30} 60 60)`}
                  />
                ))}
                <circle cx="60" cy="60" r="30" fill="#FFD54F" stroke="#FF9800" strokeWidth="3" />
                <circle cx="52" cy="52" r="9" fill="#FFF3B0" opacity="0.7" />
              </svg>
            </motion.div>

            <motion.div
              animate={{ x: [-20, 35, -20] }}
              transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
              className="absolute left-6 top-20 w-40 opacity-90 sm:left-16 sm:w-52"
            >
              <svg viewBox="0 0 200 80" className="h-auto w-full drop-shadow-sm">
                <path
                  d="M35 65 H165 C180 65 190 54 190 42 C190 31 181 22 170 21 C166 10 154 4 140 6 C132 0 116 0 107 8 C96 2 78 6 72 19 C60 17 48 24 46 35 C30 35 20 45 20 55 C20 61 27 65 35 65 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </motion.div>

            <motion.div
              animate={{ x: [25, -25, 25] }}
              transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
              className="absolute left-1/3 top-24 hidden w-44 opacity-80 md:block"
            >
              <svg viewBox="0 0 200 80" className="h-auto w-full">
                <path
                  d="M35 65 H165 C180 65 190 54 190 42 C190 31 181 22 170 21 C166 10 154 4 140 6 C132 0 116 0 107 8 C96 2 78 6 72 19 C60 17 48 24 46 35 C30 35 20 45 20 55 C20 61 27 65 35 65 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Tall Coconut Palm Trees */}
      <motion.div
        animate={{ rotate: [-1.2, 1.2, -1.2] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute bottom-6 -left-6 hidden h-[390px] w-40 origin-bottom opacity-85 lg:block"
      >
        <svg viewBox="0 0 180 420" className="h-full w-full">
          <path d="M72 420 Q60 280 92 125 L106 128 Q80 280 94 420 Z" fill="#8B5A2B" stroke="#5D3A1A" strokeWidth="2" />
          <circle cx="94" cy="134" r="9" fill="#5D3A1A" />
          <circle cx="106" cy="136" r="8" fill="#4A2E14" />
          <circle cx="100" cy="126" r="8" fill="#6E4420" />
          <path d="M98 124 Q40 90 10 132 Q55 118 98 128 Z" fill="#2E7D32" />
          <path d="M98 124 Q35 62 18 82 Q60 90 98 124 Z" fill="#388E3C" />
          <path d="M98 124 Q72 40 96 28 Q100 72 100 124 Z" fill="#43A047" />
          <path d="M100 124 Q145 55 174 88 Q138 92 100 124 Z" fill="#2E7D32" />
          <path d="M100 124 Q158 98 176 144 Q136 122 100 126 Z" fill="#1B5E20" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ rotate: [1.2, -1.2, 1.2] }}
        transition={{ repeat: Infinity, duration: 7.5, ease: 'easeInOut' }}
        className="absolute bottom-6 -right-6 hidden h-[400px] w-40 origin-bottom opacity-85 lg:block"
      >
        <svg viewBox="0 0 180 420" className="h-full w-full scale-x-[-1]">
          <path d="M72 420 Q60 280 92 125 L106 128 Q80 280 94 420 Z" fill="#8B5A2B" stroke="#5D3A1A" strokeWidth="2" />
          <circle cx="94" cy="134" r="9" fill="#5D3A1A" />
          <circle cx="106" cy="136" r="8" fill="#4A2E14" />
          <circle cx="100" cy="126" r="8" fill="#6E4420" />
          <path d="M98 124 Q40 90 10 132 Q55 118 98 128 Z" fill="#2E7D32" />
          <path d="M98 124 Q35 62 18 82 Q60 90 98 124 Z" fill="#388E3C" />
          <path d="M98 124 Q72 40 96 28 Q100 72 100 124 Z" fill="#43A047" />
          <path d="M100 124 Q145 55 174 88 Q138 92 100 124 Z" fill="#2E7D32" />
          <path d="M100 124 Q158 98 176 144 Q136 122 100 126 Z" fill="#1B5E20" />
        </svg>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-20 opacity-80 sm:h-24">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0,90 C280,20 560,130 880,70 C1140,22 1320,80 1440,55 L1440,160 L0,160 Z" fill="#5CB85C" opacity="0.65" />
          <path d="M0,115 C320,65 640,145 1020,85 C1240,50 1360,105 1440,90 L1440,160 L0,160 Z" fill="#3B943E" opacity="0.82" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Dark-mode Moon Phases Loading Indicator:
 * Cycles Crescent -> Half -> More than Half (Gibbous) -> Full -> Blank (New Moon)
 */
export const MoonPhaseLoader: React.FC = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 5);
    }, 620);
    return () => clearInterval(id);
  }, []);

  const labels = ['Crescent', 'Half Moon', 'Waxing Gibbous', 'Full Moon', 'New Moon'];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow-[0_0_12px_rgba(147,197,253,0.65)]">
        {/* Base dark moon disc */}
        <circle cx="32" cy="32" r="24" fill="#0d1d3a" stroke="#7fb2ff" strokeWidth="2" />

        {/* Phase 0: Crescent */}
        {phase === 0 && (
          <path d="M32 8 A24 24 0 0 1 32 56 A15 24 0 0 0 32 8 Z" fill="#f8fafc" />
        )}

        {/* Phase 1: Half Moon */}
        {phase === 1 && (
          <path d="M32 8 A24 24 0 0 1 32 56 Z" fill="#f8fafc" />
        )}

        {/* Phase 2: More than Half (Gibbous) */}
        {phase === 2 && (
          <path d="M32 8 A24 24 0 0 1 32 56 A13 24 0 0 1 32 8 Z" fill="#f8fafc" />
        )}

        {/* Phase 3: Full Moon */}
        {phase === 3 && (
          <circle cx="32" cy="32" r="23" fill="#fef9c3" />
        )}

        {/* Phase 4: Blank / New Moon (just glowing outline) */}
      </svg>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-300">
        {labels[phase]}
      </span>
    </div>
  );
};

/**
 * Side-shifted hand-drawn pen-ink curved arrow with short, crisp label —
 * used ONLY inside the 4-Pillar evaluated legal solution.
 */
export const SolutionSideArrow: React.FC<{
  label: string;
  side?: 'left' | 'right';
}> = ({ label, side = 'right' }) => {
  const isRight = side === 'right';

  return (
    <div
      className={`my-0.5 flex items-center gap-2 select-none ${
        isRight ? 'justify-end pr-2 sm:pr-4' : 'justify-start pl-2 sm:pl-4'
      }`}
    >
      {isRight && (
        <span className="font-editorial italic text-sm font-bold text-[var(--text-accent)]">
          {label}
        </span>
      )}

      <svg
        viewBox="0 0 92 64"
        className={`h-14 w-20 shrink-0 text-[var(--text-primary)] opacity-80 ${
          isRight ? '' : 'scale-x-[-1]'
        }`}
        fill="none"
      >
        <path
          d="M10 4 C 48 6, 78 20, 72 54"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M63 45 C 67 50, 70 54, 72 58 C 76 53, 80 49, 84 47"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!isRight && (
        <span className="font-editorial italic text-sm font-bold text-[var(--text-accent)]">
          {label}
        </span>
      )}
    </div>
  );
};
