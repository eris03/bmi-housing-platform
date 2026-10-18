// Placeholder mark until the official BMI logo is supplied.
// Swap this component's SVG for the real asset; nothing else references the artwork.

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="logo-mark">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="var(--forest)" />
      {/* plot boundary */}
      <path d="M10 36 H38 V24 L24 12 L10 24 Z" fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinejoin="round" />
      {/* survey subdivision */}
      <path d="M24 36 V24 M10 30 H38" stroke="var(--ochre)" strokeWidth="1.6" strokeDasharray="2 2.4" />
      <circle cx="24" cy="12" r="2.4" fill="var(--terracotta)" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <LogoMark />
      {!compact && (
        <span className="logo-text">
          <strong>BMI</strong>
          <small>Housing Society</small>
        </span>
      )}
    </span>
  );
}
