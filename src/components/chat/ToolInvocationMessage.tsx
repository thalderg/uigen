import type { ToolInvocation } from "ai";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ToolInvocationMessageProps {
  toolInvocation: ToolInvocation;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return `Created ${path}`;
      case "str_replace":
      case "insert":
        return `Edited ${path}`;
      case "view":
        return `Viewing ${path}`;
      case "undo_edit":
        return `Undid edit to ${path}`;
    }
  } else if (toolName === "file_manager") {
    const newPath = args?.new_path as string | undefined;
    switch (command) {
      case "rename":
        return `Renamed ${path} → ${newPath}`;
      case "delete":
        return `Deleted ${path}`;
    }
  }

  return toolName;
}

export function ToolInvocationMessage({ toolInvocation }: ToolInvocationMessageProps) {
  const isLoading = toolInvocation.state === "call" || toolInvocation.state === "partial-call";
  const label = getLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
