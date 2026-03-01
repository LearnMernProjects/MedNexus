"use client";

import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Edge, Node } from "@xyflow/react";

export type WorkflowContextType = {
  addedNodes: Node[];
  setAddedNodes: Dispatch<SetStateAction<Node[]>>;
  nodeEdges: Edge[];
  setNodeEdges: Dispatch<SetStateAction<Edge[]>>;
  selectedNode: Node | null;
  setSelectedNode: Dispatch<SetStateAction<Node | null>>;
};

export const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function useWorkflow(): WorkflowContextType {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within <WorkflowContext.Provider>");
  }
  return context;
}