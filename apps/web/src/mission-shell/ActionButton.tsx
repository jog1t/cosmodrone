type ActionButtonProps = {
  command: string;
  label: string;
  onClick: () => void;
  active?: boolean;
};

export function ActionButton({ command, label, onClick, active = false }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={`${command} ${label}`}
      onClick={onClick}
      className={`flex min-w-0 items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${
        active
          ? "bg-cyan-300/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(125,249,255,0.14)]"
          : "bg-[#05111a] text-slate-200"
      }`}
    >
      <span className="mission-mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-slate-500">
        {command}
      </span>
      <span className="truncate text-sm uppercase tracking-[0.14em]">{label}</span>
    </button>
  );
}
