import { PageHeader } from "@/components/shared/PageHeader";
import { Terminal, Book, Keyboard } from "lucide-react";

const shortcuts = [
  { keys: "⌘K", action: "Search" },
  { keys: "N", action: "New agent task" },
  { keys: "G then R", action: "Go to runs" },
  { keys: "G then P", action: "Go to projects" },
  { keys: "?", action: "Show shortcuts" },
];

export default function Help() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Help"
        description="Guides and shortcuts for working with ForgeOps."
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <Book className="h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Documentation</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Read the guides on agent tasks and approvals.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <Terminal className="h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">CLI Reference</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Control ForgeOps from your terminal.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <Keyboard className="h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Keyboard Shortcuts</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Move faster without leaving the keyboard.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
        <div className="mt-3 divide-y divide-border">
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between py-2.5"
            >
              <span className="text-sm">{s.action}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
