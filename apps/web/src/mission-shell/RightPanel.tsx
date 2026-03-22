import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { missionCode } from "./data";

type TemplateName = "MINER" | "SCOUT";
type SubTab = "Code" | "Loadout" | "Docs";

const TEMPLATES: TemplateName[] = ["MINER", "SCOUT"];

export function RightPanel() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateName>("MINER");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("Code");

  return (
    <div className="flex flex-col bg-bg-2 border-l border-border overflow-hidden">
      {/* Template tabs */}
      <div className="flex bg-bg border-b border-border shrink-0">
        {TEMPLATES.map((name) => (
          <TemplateTab
            key={name}
            name={name}
            active={activeTemplate === name}
            isMiner={name === "MINER"}
            onClick={() => setActiveTemplate(name)}
          />
        ))}
        <button className="flex items-center px-3 text-text-3 cursor-pointer ml-auto fz-base">
          +
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["Code", "Loadout", "Docs"] as SubTab[]).map((tab) => (
          <SubTabButton
            key={tab}
            label={tab}
            active={activeSubTab === tab}
            onClick={() => setActiveSubTab(tab)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeSubTab === "Code" && <CodeTab />}
        {activeSubTab === "Loadout" && <LoadoutTab />}
        {activeSubTab === "Docs" && <DocsTab />}
      </div>
    </div>
  );
}

function TemplateTab({
  name,
  active,
  isMiner,
  onClick,
}: {
  name: string;
  active: boolean;
  isMiner: boolean;
  onClick: () => void;
}) {
  const dotColor = isMiner ? "bg-drill" : "bg-sensor";

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3.5 py-2.5 font-mono font-medium tracking-wide cursor-pointer transition-colors duration-100 whitespace-nowrap fz-xs ${
        active ? "text-teal" : "text-text-3"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full opacity-70 shrink-0 ${dotColor}`} />
      {name}
      {/* Active indicator — sits on top of the container border */}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 bg-teal"
          style={{ height: 2, marginBottom: -1 }}
        />
      )}
    </button>
  );
}

function SubTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center px-3 py-2 cursor-pointer transition-colors duration-100 fz-xs ${
        active ? "text-text" : "text-text-3"
      }`}
    >
      {label}
      {/* Active indicator — sits on top of the container border */}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 bg-text-2"
          style={{ height: 1, marginBottom: -1 }}
        />
      )}
    </button>
  );
}

function CodeTab() {
  return (
    <div className="flex-1 overflow-hidden">
      <MonacoEditor
        height="100%"
        defaultLanguage="javascript"
        defaultValue={missionCode}
        theme="vs-dark"
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("cosmodrone", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "keyword", foreground: "78a9ff" },
              { token: "identifier", foreground: "c4cad8" },
              { token: "string", foreground: "3dd68c" },
              { token: "number", foreground: "ff7eb6" },
              { token: "comment", foreground: "4a5068", fontStyle: "italic" },
              { token: "delimiter", foreground: "7a8299" },
              { token: "delimiter.bracket", foreground: "7a8299" },
            ],
            colors: {
              "editor.background": "#0c0e14",
              "editor.foreground": "#c4cad8",
              "editor.lineHighlightBackground": "#ffffff05",
              "editor.selectionBackground": "#00cfc033",
              "editorLineNumber.foreground": "#4a5068",
              "editorLineNumber.activeForeground": "#7a8299",
              "editorCursor.foreground": "#00cfc0",
              "editorIndentGuide.background1": "#252a3a",
              "editorIndentGuide.activeBackground1": "#2e3550",
            },
          });
        }}
        onMount={(_, monaco) => {
          monaco.editor.setTheme("cosmodrone");
        }}
        options={{
          fontSize: 12,
          lineHeight: 20,
          fontFamily: "JetBrains Mono, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "off",
          renderLineHighlight: "line",
          lineNumbersMinChars: 3,
          padding: { top: 14, bottom: 14 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 4,
            horizontalScrollbarSize: 4,
          },
        }}
      />
    </div>
  );
}

const MOD_COLORS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  cpu: {
    bg: "rgba(120,169,255,0.15)",
    border: "rgba(120,169,255,0.45)",
    color: "var(--cpu-clr)",
    dot: "bg-cpu",
  },
  legs: {
    bg: "rgba(0,207,192,0.12)",
    border: "rgba(0,207,192,0.45)",
    color: "var(--legs-clr)",
    dot: "bg-legs",
  },
  drill: {
    bg: "rgba(240,160,48,0.13)",
    border: "rgba(240,160,48,0.45)",
    color: "var(--drill-clr)",
    dot: "bg-drill",
  },
  cargo: {
    bg: "rgba(190,149,255,0.13)",
    border: "rgba(190,149,255,0.45)",
    color: "var(--cargo-clr)",
    dot: "bg-cargo",
  },
  sensor: {
    bg: "rgba(61,214,140,0.12)",
    border: "rgba(61,214,140,0.45)",
    color: "var(--sensor-clr)",
    dot: "bg-sensor",
  },
};

// Chassis layout: 4 cols × 2 rows. Each entry is either an empty slot or a module.
// Wide modules span 2 columns. Unoccupied cells render as empty slot divs.
const CHASSIS_CELLS: Array<{
  key: string;
  label?: string;
  cls?: string;
  colSpan?: 2;
}> = [
  { key: "cpu", label: "CPU_BASIC", cls: "cpu", colSpan: 2 },
  { key: "drill", label: "DRILL I", cls: "drill" },
  { key: "cargo", label: "CARGO I", cls: "cargo" },
  { key: "legs", label: "LEGS I", cls: "legs", colSpan: 2 },
  { key: "empty-1" },
  { key: "empty-2" },
];

function LoadoutTab() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <SectionLabel>Chassis</SectionLabel>

      <div className="grid grid-cols-4 gap-1 p-2 bg-bg border border-border-2 rounded-md mb-5">
        {CHASSIS_CELLS.map((cell) =>
          cell.label && cell.cls ? (
            <ModBlock key={cell.key} label={cell.label} cls={cell.cls} colSpan={cell.colSpan} />
          ) : (
            <div key={cell.key} className="h-10 border border-border rounded-sm bg-white/2.5" />
          ),
        )}
      </div>

      <SectionLabel>Available modules</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        <PoolModule label="SENSOR I" cls="sensor" slots={1} />
        <PoolModule label="CARGO II" cls="cargo" slots={2} />
        <PoolModule label="DRILL II" cls="drill" slots={2} />
      </div>
    </div>
  );
}

function ModBlock({ label, cls, colSpan }: { label: string; cls: string; colSpan?: 2 }) {
  const c = MOD_COLORS[cls];
  return (
    <div
      className={`flex items-center justify-center font-mono font-medium cursor-grab select-none rounded-sm fz-2xs h-10 ${colSpan === 2 ? "col-span-2" : ""}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      {label}
    </div>
  );
}

function PoolModule({ label, cls, slots }: { label: string; cls: string; slots: number }) {
  const c = MOD_COLORS[cls];
  return (
    <div className="flex items-center gap-1.5 bg-bg-3 border border-border rounded-md px-2.5 py-1 font-mono text-text-2 cursor-grab fz-2xs">
      <span className={`w-1.75 h-1.75 rounded-sm shrink-0 ${c.dot}`} />
      {label}
      <span className="text-text-3 ml-0.5">{slots}s</span>
    </div>
  );
}

function DocsTab() {
  const methods = [
    { sig: "self()", desc: "Returns the current drone's state object.", cost: "0 op" },
    { sig: "base()", desc: "Returns the home base state.", cost: "0 op" },
    { sig: "moveTo(pos)", desc: "Move toward position. Resolves adjacent.", cost: "1 op" },
    { sig: "mine()", desc: "Mine ore at current tile if adjacent to ore node.", cost: "1 op" },
    { sig: "store(item)", desc: "Deposit cargo into the base when adjacent.", cost: "1 op" },
    { sig: "memory", desc: "Persistent key-value object across ticks.", cost: "—" },
  ];

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <SectionLabel>Unlocked APIs</SectionLabel>
      {methods.map((m) => (
        <div key={m.sig} className="mb-1.5 p-2.5 bg-bg-3 rounded-md border border-border">
          <div className="font-mono text-text mb-0.5 fz-xs">{m.sig}</div>
          <div className="text-text-3 leading-relaxed fz-2xs">{m.desc}</div>
          <div className="text-amber mt-0.5 fz-2xs">{m.cost}</div>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono uppercase tracking-widest text-text-3 font-medium mb-2.5 fz-2xs">
      {children}
    </div>
  );
}
