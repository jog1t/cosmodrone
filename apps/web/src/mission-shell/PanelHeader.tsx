type PanelHeaderProps = {
  title: string;
  subtitle?: string;
};

/** Shared section header used across all panels. Handles top hairline, background, and typography. */
export function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div className="panel-header" style={{ minHeight: "42px" }}>
      <div className="flex items-center gap-2.5">
        {/* Diamond glyph accent */}
        <span
          className="mission-mono text-[8px]"
          style={{ color: "var(--cold-accent-dim)" }}
          aria-hidden
        >
          ◈
        </span>
        <p
          className="mission-mono text-[10px] font-medium uppercase tracking-[0.4em]"
          style={{ color: "var(--cold-accent-dim)" }}
        >
          {title}
        </p>
      </div>
      {subtitle && (
        <span className="mission-mono text-[9px] uppercase tracking-[0.24em] text-slate-700">
          {subtitle}
        </span>
      )}
    </div>
  );
}
