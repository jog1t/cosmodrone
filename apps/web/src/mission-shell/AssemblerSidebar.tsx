import Editor from "@monaco-editor/react";
import { apiSections, missionCode, templates } from "./data";

export function AssemblerSidebar() {
  return (
    <aside className="grid min-h-0 grid-rows-[180px_minmax(0,1fr)_220px] gap-[1px] bg-[rgba(86,156,214,0.18)]">
      <section className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#061019]">
        <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            assembler
          </p>
          <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            template selector
          </span>
        </div>

        <div className="grid min-h-0 gap-[1px] bg-cyan-400/10 p-[1px]">
          {templates.map((template) => (
            <button
              key={template.name}
              type="button"
              className="flex items-center justify-between bg-[#040d15] px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-100">
                  {template.name}
                </p>
                <p className="mission-mono mt-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {template.chassis}
                </p>
              </div>
              <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/80">
                {template.state}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#040d15]">
        <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            editor :: monaco
          </p>
          <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            typescript template
          </span>
        </div>

        <div className="grid min-h-0 grid-rows-[36px_minmax(0,1fr)] p-2">
          <div className="mission-mono flex items-center justify-between border border-b-0 border-cyan-400/12 bg-[#06111a] px-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="text-cyan-200/80">miner-alpha.ts</span>
              <span>tick loop</span>
            </div>
            <div className="flex items-center gap-3">
              <span>ts</span>
              <span>utf-8</span>
            </div>
          </div>

          <div className="editor-shell min-h-0 overflow-hidden border border-cyan-400/12 bg-[#02070d] shadow-[inset_0_0_0_1px_rgba(8,145,178,0.08),0_0_32px_rgba(6,182,212,0.08)]">
            <Editor
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("cosmodrone-terminal", {
                  base: "vs-dark",
                  inherit: true,
                  colors: {
                    "editor.background": "#02070d",
                    "editor.foreground": "#d9f7ff",
                    "editor.lineHighlightBackground": "#08131b",
                    "editorLineNumber.foreground": "#416072",
                    "editorLineNumber.activeForeground": "#8ce7ff",
                    "editorCursor.foreground": "#7df9ff",
                    "editor.selectionBackground": "#123245",
                    "editor.inactiveSelectionBackground": "#0b2230",
                    "editorWhitespace.foreground": "#143040",
                    "editorIndentGuide.background1": "#0f2532",
                    "editorIndentGuide.activeBackground1": "#1d4257",
                  },
                  rules: [
                    { token: "keyword", foreground: "7df9ff" },
                    { token: "identifier", foreground: "d9f7ff" },
                    { token: "delimiter", foreground: "63cde8" },
                    { token: "string", foreground: "ffd166" },
                    { token: "number", foreground: "ff9e64" },
                    { token: "comment", foreground: "5f8ea3" },
                    { token: "type.identifier", foreground: "8df7b5" },
                  ],
                });
              }}
              defaultLanguage="typescript"
              defaultValue={missionCode}
              height="100%"
              loading={<div className="p-4 text-sm text-slate-400">Loading editor...</div>}
              options={{
                automaticLayout: true,
                cursorBlinking: "phase",
                cursorSmoothCaretAnimation: "on",
                fontFamily: "IBM Plex Mono, monospace",
                fontLigatures: false,
                fontSize: 13,
                lineDecorationsWidth: 12,
                lineHeight: 22,
                lineNumbersMinChars: 3,
                minimap: { enabled: false },
                overviewRulerBorder: false,
                padding: { top: 18, bottom: 18 },
                renderLineHighlight: "line",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                  horizontalScrollbarSize: 8,
                  useShadows: false,
                  verticalScrollbarSize: 8,
                },
                smoothScrolling: true,
                wordWrap: "on",
              }}
              theme="cosmodrone-terminal"
            />
          </div>
        </div>
      </section>

      <section className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#061019]">
        <div className="flex items-center border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            api docs
          </p>
        </div>

        <div className="min-h-0 overflow-auto p-4">
          <div className="grid gap-4">
            {apiSections.map((section) => (
              <article key={section.title} className="border border-cyan-400/12 bg-[#040d15] p-4">
                <h3 className="text-sm uppercase tracking-[0.2em] text-slate-100">
                  {section.title}
                </h3>
                <div className="mission-mono mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                  {section.entries.map((entry) => (
                    <span key={entry} className="border border-cyan-400/12 px-2 py-2">
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
