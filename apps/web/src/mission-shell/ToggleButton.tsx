type ToggleButtonProps = {
  active: boolean;
  command: string;
  label: string;
  onClick: () => void;
};

export function ToggleButton({ active, command, label, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-label={`${command} ${label}`}
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-4 text-left ${
        active ? "bg-[#0a1a24] text-cyan-100" : "bg-[#05111a] text-slate-200"
      }`}
    >
      <span className="mission-mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-slate-500">
        {command}
      </span>
      <span className="truncate text-sm uppercase tracking-[0.14em]">{label}</span>
    </button>
  );
}
