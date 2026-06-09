import { useRef } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo2, Redo2, Link, Image,
  Code2, Quote, Table, Minus, Maximize2, Minimize2,
  Download, Upload, Moon, Sun,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { htmlToMarkdown, htmlToPlainText, markdownToHtml, downloadFile } from "./markdownUtils";

interface Props {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  getContent: () => string;
  setContent: (html: string) => void;
  pageName: string;
}

function Btn({
  title, onClick, children,
}: { title: string; onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(e); }}
      className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-foreground/80 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />;
}

const selClass = "text-xs border border-border rounded-md px-1.5 py-1 bg-card text-foreground focus:outline-none cursor-pointer hover:border-primary/40 transition-colors";

export function EditorToolbar({ isFullscreen, onToggleFullscreen, getContent, setContent, pageName }: Props) {
  const { isDark, toggle } = useTheme();
  const colorRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const exec = (cmd: string, val?: string) => document.execCommand(cmd, false, val);
  const ins = (html: string) => document.execCommand("insertHTML", false, html);

  const exportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${pageName}</title>
      <style>body{font-family:Georgia,serif;font-size:16px;line-height:1.8;color:#111;max-width:800px;margin:0 auto;padding:48px}
      h1,h2,h3{margin:.5em 0}blockquote{border-left:4px solid #4f46e5;padding:8px 16px;background:#f5f3ff;margin:8px 0;font-style:italic}
      pre{background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:14px}
      table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:8px}
      ul{list-style:disc;padding-left:24px}ol{list-style:decimal;padding-left:24px}a{color:#4f46e5}</style>
    </head><body><h1>${pageName}</h1>${getContent()}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const exportTxt = () =>
    downloadFile(`${pageName}\n${"=".repeat(pageName.length)}\n\n${htmlToPlainText(getContent())}`, `${pageName}.txt`, "text/plain");

  const exportMd = () =>
    downloadFile(`# ${pageName}\n\n${htmlToMarkdown(getContent())}`, `${pageName}.md`, "text/markdown");

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const html = markdownToHtml(ev.target?.result as string);
      setContent(html);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-muted/60 border-b border-border select-none sticky top-16 z-20">
      {/* Style */}
      <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { exec("formatBlock", e.target.value === "p" ? "<p>" : `<${e.target.value}>`); e.target.value = "p"; }} defaultValue="p" className={selClass} title="Style">
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="blockquote">Blockquote</option>
        <option value="pre">Code Block</option>
      </select>
      <Sep />

      {/* Font */}
      <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => exec("fontName", e.target.value)} defaultValue="Georgia" className={selClass} title="Font Family">
        <option value="Georgia">Georgia</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
      </select>
      <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => exec("fontSize", e.target.value)} defaultValue="3" className={`${selClass} ml-1`} title="Font Size">
        <option value="1">Small</option>
        <option value="2">Normal</option>
        <option value="3">Medium</option>
        <option value="4">Large</option>
        <option value="5">X-Large</option>
        <option value="6">XX-Large</option>
        <option value="7">Huge</option>
      </select>
      <Sep />

      {/* Format */}
      <Btn title="Bold (Ctrl+B)" onClick={() => exec("bold")}><Bold size={14} /></Btn>
      <Btn title="Italic (Ctrl+I)" onClick={() => exec("italic")}><Italic size={14} /></Btn>
      <Btn title="Underline (Ctrl+U)" onClick={() => exec("underline")}><Underline size={14} /></Btn>
      <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough size={14} /></Btn>
      <Sep />

      {/* Colors */}
      <div className="relative" title="Text Color">
        <button onMouseDown={(e) => { e.preventDefault(); colorRef.current?.click(); }} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-0.5 text-foreground/80">
          <span className="text-xs" style={{ fontWeight: 700 }}>A</span>
          <span className="w-2.5 h-1 rounded-sm bg-red-500 block" id="nf-color-dot" />
        </button>
        <input ref={colorRef} type="color" defaultValue="#ef4444" className="absolute opacity-0 w-0 h-0 pointer-events-none" onChange={(e) => { const el = document.getElementById("nf-color-dot"); if (el) el.style.backgroundColor = e.target.value; exec("foreColor", e.target.value); }} />
      </div>
      <div className="relative" title="Highlight">
        <button onMouseDown={(e) => { e.preventDefault(); highlightRef.current?.click(); }} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center text-foreground/80">
          <span className="text-xs px-0.5 rounded" style={{ background: "#fef08a", color: "#000" }}>H</span>
        </button>
        <input ref={highlightRef} type="color" defaultValue="#fef08a" className="absolute opacity-0 w-0 h-0 pointer-events-none" onChange={(e) => exec("hiliteColor", e.target.value)} />
      </div>
      <Sep />

      {/* Align */}
      <Btn title="Align Left" onClick={() => exec("justifyLeft")}><AlignLeft size={14} /></Btn>
      <Btn title="Center" onClick={() => exec("justifyCenter")}><AlignCenter size={14} /></Btn>
      <Btn title="Align Right" onClick={() => exec("justifyRight")}><AlignRight size={14} /></Btn>
      <Btn title="Justify" onClick={() => exec("justifyFull")}><AlignJustify size={14} /></Btn>
      <Sep />

      {/* Lists */}
      <Btn title="Bullet List" onClick={() => exec("insertUnorderedList")}><List size={14} /></Btn>
      <Btn title="Numbered List" onClick={() => exec("insertOrderedList")}><ListOrdered size={14} /></Btn>
      <Btn title="Checklist" onClick={() => ins(`<div style="display:flex;align-items:center;gap:6px;margin:4px 0"><input type="checkbox" style="width:14px;height:14px;cursor:pointer"><span>Task item</span></div>`)}>
        <span className="text-sm leading-none">☑</span>
      </Btn>
      <Sep />

      {/* Insert */}
      <Btn title="Link" onClick={() => { const u = prompt("URL:", "https://"); if (u) exec("createLink", u); }}><Link size={14} /></Btn>
      <Btn title="Image" onClick={() => { const u = prompt("Image URL:", "https://"); if (u) ins(`<img src="${u}" style="max-width:100%;height:auto;border-radius:6px;margin:8px 0" alt="image"/>`); }}><Image size={14} /></Btn>
      <Btn title="Table" onClick={() => ins(`<table style="border-collapse:collapse;width:100%;margin:8px 0"><tbody><tr><td style="border:1px solid #e2e8f0;padding:8px">Cell 1</td><td style="border:1px solid #e2e8f0;padding:8px">Cell 2</td><td style="border:1px solid #e2e8f0;padding:8px">Cell 3</td></tr><tr><td style="border:1px solid #e2e8f0;padding:8px">Cell 4</td><td style="border:1px solid #e2e8f0;padding:8px">Cell 5</td><td style="border:1px solid #e2e8f0;padding:8px">Cell 6</td></tr></tbody></table><p><br></p>`)}>
        <Table size={14} />
      </Btn>
      <Btn title="Code Block" onClick={() => ins(`<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;overflow:auto;margin:8px 0"><code>// code here</code></pre><p><br></p>`)}>
        <Code2 size={14} />
      </Btn>
      <Btn title="Blockquote" onClick={() => exec("formatBlock", "<blockquote>")}><Quote size={14} /></Btn>
      <Btn title="Horizontal Rule" onClick={() => document.execCommand("insertHorizontalRule")}><Minus size={14} /></Btn>
      <Sep />

      {/* Undo/Redo */}
      <Btn title="Undo" onClick={() => exec("undo")}><Undo2 size={14} /></Btn>
      <Btn title="Redo" onClick={() => exec("redo")}><Redo2 size={14} /></Btn>
      <Sep />

      {/* Export */}
      <div className="relative group/exp">
        <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-foreground/80">
          <Download size={13} /> Export
        </button>
        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden opacity-0 group-hover/exp:opacity-100 pointer-events-none group-hover/exp:pointer-events-auto transition-opacity z-30 min-w-40">
          {[
            { label: "📄 PDF (Print)", fn: exportPDF },
            { label: "📝 Plain Text (.txt)", fn: exportTxt },
            { label: "📋 Markdown (.md)", fn: exportMd },
          ].map(({ label, fn }) => (
            <button key={label} onMouseDown={(e) => { e.preventDefault(); fn(); }} className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-muted transition-colors text-foreground/80 hover:text-foreground">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Import */}
      <button onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }} className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-foreground/80">
        <Upload size={13} /> Import .md
      </button>
      <input ref={fileRef} type="file" accept=".md,.txt" className="hidden" onChange={handleImport} />
      <Sep />

      {/* Dark mode + Fullscreen */}
      <Btn title={isDark ? "Light Mode" : "Dark Mode"} onClick={toggle}>
        {isDark ? <Sun size={14} /> : <Moon size={14} />}
      </Btn>
      <Btn title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={onToggleFullscreen}>
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </Btn>
    </div>
  );
}
