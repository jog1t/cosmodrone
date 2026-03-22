type ToggleButtonProps = {
  active: boolean;
  command: string;
  label: string;
  onClick: () => void;
};

export function ToggleButton({ active, command, label, onClick }: ToggleButtonProps) {
  const activeStyle = {
    background: "linear-gradient(180deg, #0b1e30 0%, #071728 100%)",
    boxShadow: "inset 0 0 0 1px rgba(80,180,230,0.22)",
    color: "var(--cold-accent)",
  };

  const inactiveStyle = {
    background: "linear-gradient(180deg, #081422 0%, #040e1a 100%)",
    boxShadow: "inset 0 0 0 1px rgba(50,110,160,0.08)",
    color: "#607080",
  };

  return (
    <button
      type="button"
      aria-label={`${command} ${label}`}
      onClick={onClick}
      className="group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden px-2 py-0 text-center transition-all duration-150 hover:brightness-125"
      style={active ? activeStyle : inactiveStyle}
    >
      {/* Top glass hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: active
            ? "linear-gradient(90deg,transparent,rgba(80,180,230,0.22),transparent)"
            : "linear-gradient(90deg,transparent,rgba(80,180,230,0.1),transparent)",
        }}
      />
      <span className="mission-mono text-[8px] uppercase tracking-[0.2em] text-slate-700">
        {command}
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">{label}</span>
    </button>
  );
}
