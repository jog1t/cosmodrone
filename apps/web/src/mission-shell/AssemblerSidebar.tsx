import Editor from "@monaco-editor/react";
import { PanelHeader } from "./PanelHeader";
import { apiSections, missionCode, templates } from "./data";

export function AssemblerSidebar() {
  return (
    <aside
      className="grid min-h-0 grid-rows-[168px_minmax(0,1fr)_210px] gap-px"
      style={{ background: "var(--panel-separator)" }}
    >
      {/* ── Template selector ── */}
      <section
        className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
        style={{ background: "var(--panel-bg-alt)" }}
      >
        <PanelHeader title="Assembler" subtitle="template selector" />

        <div className="grid min-h-0 gap-px p-px" style={{ background: "var(--cold-border)" }}>
          {templates.map((template) => (
            <button
              key={template.name}
              type="button"
              className="relative flex items-center justify-between overflow-hidden px-4 py-2.5 text-left transition-colors hover:brightness-125"
              style={{ background: "var(--panel-bg)" }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
                style={{ background: "rgba(55,120,170,0.2)" }}
              />
              <div>
                <p className="text-[14px] font-medium uppercase tracking-[0.12em] text-slate-200">
                  {template.name}
                </p>
                <p className="mission-mono mt-0.5 text-[9px] uppercase tracking-[0.28em] text-slate-600">
                  {template.chassis}
                </p>
              </div>
              <span
                className="mission-mono text-[9px] uppercase tracking-[0.22em]"
                style={{ color: "var(--cold-accent-dim)" }}
              >
                {template.state}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Monaco editor ── */}
      <section
        className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
        style={{ background: "var(--panel-bg)" }}
      >
        <PanelHeader title="Editor · Monaco" subtitle="typescript template" />

        <div className="grid min-h-0 grid-rows-[32px_minmax(0,1fr)] p-2">
          {/* File tab bar */}
          <div
            className="mission-mono flex items-center justify-between border border-b-0 px-3 text-[9px] uppercase tracking-[0.22em]"
            style={{
              background: "var(--panel-bg-alt)",
              borderColor: "var(--cold-border)",
              color: "#506070",
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ color: "var(--cold-accent-dim)" }}>miner-alpha.ts</span>
              <span>tick loop</span>
            </div>
            <div className="flex items-center gap-4">
              <span>ts</span>
              <span>utf-8</span>
            </div>
          </div>

          <div
            className="editor-shell min-h-0 overflow-hidden"
            style={{
              border: "1px solid var(--cold-border)",
              boxShadow: "inset 0 0 0 1px rgba(8,100,150,0.06), 0 0 28px rgba(6,100,160,0.06)",
            }}
          >
            <Editor
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("cosmodrone-terminal", {
                  base: "vs-dark",
                  inherit: true,
                  colors: {
                    "editor.background": "#010508",
                    "editor.foreground": "#c8dce8",
                    "editor.lineHighlightBackground": "#060f18",
                    "editorLineNumber.foreground": "#2a4050",
                    "editorLineNumber.activeForeground": "#507080",
                    "editorCursor.foreground": "#64c3f0",
                    "editor.selectionBackground": "#0d2535",
                    "editor.inactiveSelectionBackground": "#081a28",
                    "editorWhitespace.foreground": "#0f2030",
                    "editorIndentGuide.background1": "#0c1e2c",
                    "editorIndentGuide.activeBackground1": "#172e40",
                  },
                  rules: [
                    { token: "keyword", foreground: "64c3f0" },
                    { token: "identifier", foreground: "c8dce8" },
                    { token: "delimiter", foreground: "4a8fa8" },
                    { token: "string", foreground: "e8b86a" },
                    { token: "number", foreground: "d08858" },
                    { token: "comment", foreground: "3a5c6e" },
                    { token: "type.identifier", foreground: "72d4a0" },
                  ],
                });
              }}
              defaultLanguage="typescript"
              defaultValue={missionCode}
              height="100%"
              loading={
                <div
                  className="mission-mono p-4 text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: "var(--cold-accent-dim)" }}
                >
                  Initializing editor...
                </div>
              }
              options={{
                automaticLayout: true,
                cursorBlinking: "phase",
                cursorSmoothCaretAnimation: "on",
                fontFamily: "IBM Plex Mono, monospace",
                fontLigatures: false,
                fontSize: 12,
                lineDecorationsWidth: 12,
                lineHeight: 21,
                lineNumbersMinChars: 3,
                minimap: { enabled: false },
                overviewRulerBorder: false,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: "line",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                  horizontalScrollbarSize: 6,
                  useShadows: false,
                  verticalScrollbarSize: 6,
                },
                smoothScrolling: true,
                wordWrap: "on",
              }}
              theme="cosmodrone-terminal"
            />
          </div>
        </div>
      </section>

      {/* ── API docs ── */}
      <section
        className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
        style={{ background: "var(--panel-bg-alt)" }}
      >
        <PanelHeader title="API Docs" />

        <div className="min-h-0 overflow-auto p-3">
          <div className="grid gap-2.5">
            {apiSections.map((section) => (
              <article
                key={section.title}
                className="relative overflow-hidden p-3 pl-4"
                style={{
                  background: "var(--panel-bg)",
                  border: "1px solid var(--cold-border)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
                  style={{ background: "rgba(55,120,170,0.25)" }}
                />
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  {section.title}
                </h3>
                <div className="mission-mono mt-2 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.18em]">
                  {section.entries.map((entry) => (
                    <span
                      key={entry}
                      className="px-2 py-1.5"
                      style={{
                        background: "rgba(30,60,90,0.25)",
                        border: "1px solid var(--cold-border)",
                        color: "var(--cold-accent-dim)",
                      }}
                    >
                      {entry}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
