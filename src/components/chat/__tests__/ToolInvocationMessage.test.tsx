import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationMessage } from "../ToolInvocationMessage";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "partial-call" | "result"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result: {} } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

test("str_replace_editor create in call state shows label and spinner", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")}
    />
  );
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("str_replace_editor create in result state shows label and check icon, no spinner", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("str_replace_editor str_replace shows Edited label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/App.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Edited /App.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Edited label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/App.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Edited /App.jsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/App.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("file_manager rename shows Renamed label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Renamed /old.jsx → /new.jsx")).toBeDefined();
});

test("file_manager delete shows Deleted label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/App.jsx" }, "result")}
    />
  );
  expect(screen.getByText("Deleted /App.jsx")).toBeDefined();
});

test("unknown tool falls back to tool name", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={makeInvocation("some_unknown_tool", {}, "result")}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});
