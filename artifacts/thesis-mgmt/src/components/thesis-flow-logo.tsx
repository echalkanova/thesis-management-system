/** Reusable ThesisFlow brand components */

/** The official ThesisFlow logo image */
export function ThesisFlowIcon({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/thesisflow-logo.png"
      alt="ThesisFlow"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
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
