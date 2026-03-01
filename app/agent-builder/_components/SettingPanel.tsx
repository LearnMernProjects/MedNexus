"use client";

import React from "react";
import type { Node } from "@xyflow/react";
import { useWorkflow } from "@/app/context/WorkflowContext";

type AgentNodeData = {
  name?: string;
  instruction?: string;
  outputFormat?: "text" | "json" | "markdown";
  output?: string;
  outputJsonFormat?: string;
  model?: string;
  includeHistory?: boolean;
  modelOptions?: string[];
  [key: string]: unknown;
};

const defaultModels = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o-mini"];

function AgentSettings() {
  const { selectedNode, setAddedNodes, setSelectedNode } = useWorkflow();

  if (!selectedNode) {
    return (
      <div className="text-sm text-gray-500">
        Select an Agent node to edit settings.
      </div>
    );
  }

  const data = (selectedNode.data ?? {}) as AgentNodeData;

  const name = data.name ?? "";
  const instruction = data.instruction ?? "";
  const outputFormat = data.outputFormat ?? "text";
  const output = data.output ?? "";
  const outputJsonFormat = data.outputJsonFormat ?? "";
  const modelOptions = data.modelOptions?.length ? data.modelOptions : defaultModels;
  const model = data.model ?? modelOptions[0];
  const includeHistory = Boolean(data.includeHistory);

  const updateNodeData = (patch: Partial<AgentNodeData>) => {
    const updatedNode: Node = {
      ...selectedNode,
      data: {
        ...(selectedNode.data ?? {}),
        ...patch,
      },
    };

    setSelectedNode(updatedNode);
    setAddedNodes((prev) =>
      prev.map((node) => (node.id === selectedNode.id ? updatedNode : node))
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Agent Settings</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => updateNodeData({ name: e.target.value })}
          placeholder="Enter agent name"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Instruction</label>
        <textarea
          value={instruction}
          onChange={(e) => updateNodeData({ instruction: e.target.value })}
          placeholder="Write agent instruction..."
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Model</label>
        <select
          value={model}
          onChange={(e) => updateNodeData({ model: e.target.value })}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          {modelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Output Format</label>
        <select
          value={outputFormat}
          onChange={(e) =>
            updateNodeData({
              outputFormat: e.target.value as AgentNodeData["outputFormat"],
            })
          }
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>

      {/* Restored textarea for normal output format */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Output (Text/Markdown)</label>
        <textarea
          value={output}
          onChange={(e) => updateNodeData({ output: e.target.value })}
          placeholder="Describe expected output format..."
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Restored textarea for JSON output format */}
      <div className="space-y-1">
        <label className="text-sm font-medium">JSON Output Format</label>
        <textarea
          value={outputJsonFormat}
          onChange={(e) => updateNodeData({ outputJsonFormat: e.target.value })}
          placeholder='e.g. { "title": "string", "summary": "string", "score": "number" }'
          rows={4}
          className="w-full rounded-md border px-3 py-2 text-sm font-mono outline-none resize-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">Include History</p>
          <p className="text-xs text-gray-500">Use previous chat context</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={includeHistory}
          onClick={() => updateNodeData({ includeHistory: !includeHistory })}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            includeHistory ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
              includeHistory ? "translate-x-7" : "translate-x-1"
            }`}
          />
          <span className="sr-only">Toggle include history</span>
        </button>
      </div>
    </div>
  );
}

const SettingPanel = () => {
  return (
    <div className="bg-white p-5 rounded-2xl w-[350px] shadow">
      <AgentSettings />
    </div>
  );
};

export default SettingPanel;