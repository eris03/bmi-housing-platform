// Animated hero: contour lines of open land, plot boundaries surveying in,
// homes rising on the plots, the sun tracing its arc. Pure SVG + CSS.
// Honours prefers-reduced-motion via globals.css.

const HOUSES = [
  { x: 118, y: 236, d: 0.0 },
  { x: 198, y: 236, d: 0.15 },
  { x: 278, y: 236, d: 0.3 },
  { x: 158, y: 300, d: 0.45 },
  { x: 238, y: 300, d: 0.6 },
  { x: 318, y: 300, d: 0.75 },
];

export function HeroLandscape() {
  return (
    <svg className="hero-landscape" viewBox="0 0 440 400" role="img" aria-label="Illustration of land being surveyed into plots with homes rising">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" />
          <stop offset="1" stopColor="var(--sky-bottom)" />
        </linearGradient>
        <clipPath id="frame">
          <rect x="0" y="0" width="440" height="400" rx="28" />
        </clipPath>
      </defs>
      <g clipPath="url(#frame)">
        <rect width="440" height="400" fill="url(#sky)" />
        {/* sun on its arc */}
        <g className="sun-orbit">
          <circle cx="330" cy="92" r="26" fill="var(--ochre)" opacity="0.9" />
          <circle cx="330" cy="92" r="40" fill="var(--ochre)" opacity="0.18" />
        </g>
        {/* distant hills */}
        <path d="M0 190 C70 150 120 170 180 160 S300 130 440 170 V400 H0Z" fill="var(--sage-soft)" />
        <path d="M0 210 C90 190 160 205 240 195 S360 180 440 200 V400 H0Z" fill="var(--sage)" opacity="0.55" />
        {/* trees */}
        {[40, 62, 390, 410].map((x, i) => (
          <g key={x} className="tree" style={{ animationDelay: `${i * 0.4}s` }}>
            <rect x={x - 1.5} y={196} width="3" height="14" fill="var(--forest)" />
            <circle cx={x} cy={192} r="10" fill="var(--forest)" opacity="0.85" />
          </g>
        ))}
        {/* ground plane with contour lines */}
        <path d="M0 215 H440 V400 H0Z" fill="var(--land)" />
        {[240, 268, 300, 336, 376].map((y, i) => (
          <path
            key={y}
            className="contour"
            d={`M-10 ${y} C 90 ${y - 10 - i * 2} 180 ${y + 8} 260 ${y - 4} S 400 ${y + 6} 450 ${y - 6}`}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
        {/* plot boundaries surveying in */}
        <g className="plot-lines">
          <path d="M90 214 L350 214 L380 340 L60 340 Z" />
          <path d="M80 277 L365 277" />
          <path d="M170 214 L160 340 M250 214 L250 340 M330 214 L340 340" />
        </g>
        {/* survey pegs */}
        {[[90, 214], [350, 214], [380, 340], [60, 340]].map(([x, y], i) => (
          <circle key={i} className="peg" cx={x} cy={y} r="4" style={{ animationDelay: `${1.2 + i * 0.1}s` }} />
        ))}
        {/* homes rising */}
        {HOUSES.map((h, i) => (
          <g key={i} className="house" style={{ animationDelay: `${1.6 + h.d}s`, transformOrigin: `${h.x}px ${h.y + 22}px` }}>
            <rect x={h.x - 16} y={h.y} width="32" height="22" rx="2" fill="var(--cream)" stroke="var(--forest)" strokeWidth="1.5" />
            <path d={`M${h.x - 20} ${h.y + 2} L${h.x} ${h.y - 14} L${h.x + 20} ${h.y + 2}Z`} fill="var(--terracotta)" />
            <rect x={h.x - 4} y={h.y + 10} width="8" height="12" fill="var(--forest)" />
          </g>
        ))}
      </g>
    </svg>
  );
}
