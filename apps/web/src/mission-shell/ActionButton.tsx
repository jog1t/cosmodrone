type ActionButtonProps = {
  command: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

export function ActionButton({
  command,
  label,
  onClick,
  active = false,
  disabled = false,
}: ActionButtonProps) {
  const activeStyle = {
    background: "linear-gradient(180deg, #1c1005 0%, #120b02 100%)",
    boxShadow: "inset 0 0 0 1px rgba(200,130,50,0.28), 0 0 14px rgba(180,110,30,0.1)",
    color: "var(--warm-accent)",
  };

  const inactiveStyle = {
    background: "linear-gradient(180deg, #081422 0%, #040e1a 100%)",
    boxShadow: "inset 0 0 0 1px rgba(50,110,160,0.1)",
    color: "#8090a8",
  };

  return (
    <button
      type="button"
      aria-label={`${command} ${label}`}
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-2 py-0 text-center transition-all duration-150 ${
        disabled ? "cursor-not-allowed opacity-35" : "hover:brightness-125"
      }`}
      style={active ? activeStyle : inactiveStyle}
    >
      {/* Top glass hairline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: active
            ? "linear-gradient(90deg,transparent,rgba(220,150,60,0.3),transparent)"
            : "linear-gradient(90deg,transparent,rgba(80,180,230,0.12),transparent)",
        }}
      />
      {/* Bottom glow line when active */}
      {active && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(220,150,60,0.5),transparent)",
          }}
        />
      )}
      <span className="mission-mono text-[8px] uppercase tracking-[0.2em] text-slate-700">
        {command}
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">{label}</span>
    </button>
  );
}
