export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
      {label}
    </span>
  );
}
