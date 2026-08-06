/** Reusable ThesisFlow brand components */

/** The hex+graduation-cap SVG icon */
export function ThesisFlowIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon stripes */}
      <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="#4f46e5" opacity="0.12" />
      {/* Stripe lines inside hex */}
      <line x1="14" y1="28" x2="66" y2="28" stroke="#4f46e5" strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="10" y1="38" x2="70" y2="38" stroke="#4f46e5" strokeWidth="5.5" strokeLinecap="round"/>
      <line x1="14" y1="48" x2="66" y2="48" stroke="#4f46e5" strokeWidth="5.5" strokeLinecap="round"/>
      {/* Hex border */}
      <polygon points="40,4 72,22 72,58 40,76 8,58 8,22" fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinejoin="round"/>
      {/* White cut-out hexagon for inner hex shape */}
      <polygon points="40,20 56,29 56,47 40,56 24,47 24,29" fill="white"/>
      {/* Inner hex border */}
      <polygon points="40,20 56,29 56,47 40,56 24,47 24,29" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round"/>
      {/* Graduation cap */}
      <rect x="33" y="35" width="14" height="9" rx="1.5" fill="#4f46e5"/>
      <polygon points="40,30 50,35 40,40 30,35" fill="#4f46e5"/>
      <line x1="50" y1="35" x2="50" y2="41" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="50" cy="43" r="2" fill="#4f46e5"/>
      {/* Dots */}
      <circle cx="14" cy="20" r="4" fill="#4f46e5"/>
      <circle cx="20" cy="40" r="3.5" fill="#4f46e5"/>
      <circle cx="64" cy="56" r="4" fill="#4f46e5"/>
      <circle cx="58" cy="62" r="2.5" fill="#4f46e5"/>
    </svg>
  );
}

/** "ThesisFlow" wordmark — Thesis dark, Flow purple */
export function ThesisFlowWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span className="text-[#1e1b4b]">Thesis</span>
      <span className="text-[#4f46e5]">Flow</span>
    </span>
  );
}
