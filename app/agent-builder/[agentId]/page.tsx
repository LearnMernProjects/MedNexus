'use client';
import React, { useState, useCallback, useContext, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel,
  Handle,
  Position,
  useOnSelectionChange,
} from "@xyflow/react";
import UserApprovalNode from "../_customNodes/UserApprovalNode";
import ApiNode from "../_customNodes/ApiNode";
import "@xyflow/react/dist/style.css";
import Header from "../_components/Header";
import StartNode from "../_customNodes/StartNode";
import AgentNode from "../_customNodes/AgentNode";
import IfElseNode from "../_customNodes/ifElseNode";
import WhileNode from "../_customNodes/whileNode";
import AgentToolsPanel from "../_components/AgentToolsPanel";
import { WorkflowContext } from '@/app/context/WorkflowContext';
import { api } from '@/convex/_generated/api';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Save, Square, X } from 'lucide-react';
import SettingPanel from "../_components/SettingPanel";
import { Doc } from "@/convex/_generated/dataModel";
// ...existing code...
// ...existing code...
// Simple node components for missing types
import { OnSelectionChangeParams } from "@xyflow/react";
const EndNode = ({ id, data }: any) => (
  <div className='relative bg-white rounded-2xl p-2 px-3 border-2 border-red-500'>
    <button
      type='button'
      className='nodrag nopan absolute -top-2 -right-2 h-5 w-5 rounded-full border bg-white flex items-center justify-center hover:bg-gray-100'
      onClick={(event) => {
        event.stopPropagation();
        data?.onDelete?.(id);
      }}
      aria-label='Delete node'
    >
      <X className='h-3 w-3' />
    </button>
    <div className='flex gap-2 items-center'>
      <Square className='p-2 rounded-lg h-8 w-8 bg-red-100'/>
      <h2 className='text-sm font-medium'>End</h2>
      <Handle type='target' position={Position.Left} />
    </div>
  </div>
);

const ApprovalNode = () => (
  <div className='bg-white rounded-2xl p-2 px-3 border-2 border-purple-500'>
    <Handle type='target' position={Position.Left} />
    <h2 className='text-sm font-medium'>Approval</h2>
    <Handle type='source' position={Position.Right} />
  </div>
);

const nodeTypes = {
  StartNode,
  AgentNode,
  EndNode: EndNode,
  ifElseNode: IfElseNode,
  whileNode: WhileNode,
  UserApprovalNode: UserApprovalNode,
  apiNode: ApiNode,
};

function sanitizeForConvex(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForConvex(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, fieldValue]) => fieldValue !== undefined && typeof fieldValue !== "function")
      .map(([key, fieldValue]) => [key, sanitizeForConvex(fieldValue)]);

    return Object.fromEntries(entries);
  }

  if (value === undefined || typeof value === "function") {
    return undefined;
  }

  return value;
}

function AgentBuilder() {
  const params = useParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const {agentId} = useParams();
  const convex= useConvex();
  const [agentDetail, setAgentDetail] = useState<Doc<"AgentTable"> | undefined>();
  const context = useContext(WorkflowContext);
  const {addedNodes, setAddedNodes, nodeEdges, setNodeEdges, setSelectedNode} = context || {};
  const agentDetails = useQuery(api.agent.GetAgentById, agentId ? { agentId: agentId as string } : "skip");
  const updateAgentDetail = useMutation(api.agent.UpdateAgentDetails);
useEffect(() => {
  GetAgentDetails();
},[]);
const GetAgentDetails = async () => {
  const result = await convex.query(api.agent.GetAgentById, { agentId: agentId as string });

setAgentDetail(result);
}
  // Load agent data from database on initial load
  useEffect(() => {
    if (agentDetails && !isInitialized) {
      if (agentDetails.nodes && agentDetails.nodes.length > 0) {
        setNodes(agentDetails.nodes);
        setEdges(agentDetails.edges || []);
      } else {
        // If no saved nodes, initialize with StartNode
        setNodes([
          {
            id: 'start-node',
            type: 'StartNode',
            data: { label: 'Start' },
            position: { x: 100, y: 100 },
          },
        ]);
        setEdges([]);
      }
      setIsInitialized(true);
    }
  }, [agentDetails, isInitialized]);

  const SaveNodesAndEdges = async () => {
    if (!agentDetails?._id) {
      toast.error("Agent not loaded yet");
      return;
    }

    const sanitizedNodes = sanitizeForConvex(nodes) as Node[];
    const sanitizedEdges = sanitizeForConvex(edges) as Edge[];

    const result = await updateAgentDetail({
      id: agentDetails._id,
      nodes: sanitizedNodes,
      edges: sanitizedEdges
    });
    toast.success("Workflow saved successfully!");
  };

  const removeNode = useCallback((nodeId: string) => {
    if (nodeId === 'start-node') {
      toast.error('Start node cannot be deleted');
      return;
    }

    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSelectedNode?.(null);
  }, [setSelectedNode]);

  const nodesForRender = nodes.map((node) => ({
    ...node,
    data: {
      ...(node.data as Record<string, unknown>),
      onDelete: removeNode,
    },
  }));

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => {
      const updated = applyNodeChanges(changes, nodesSnapshot);
      return updated;
    }),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        return updated;
      });
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const updated = addEdge(params, eds);
        return updated;
      });
    },
    []
  );
  const onNodeSelect = useCallback(({ nodes }: OnSelectionChangeParams) => {
    if (nodes.length > 0) {
      setSelectedNode?.(nodes[0]);
      console.log("Selected node:", nodes[0]);
    } else {
      setSelectedNode?.(null);
    }
  }, []);
  useOnSelectionChange({
    onChange: onNodeSelect  })
  return (
    <div className="flex flex-col h-screen">
      {agentDetails && <Header agentDetail={agentDetails} />}

      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full rounded-xl border border-emerald-200 bg-emerald-50">
          <ReactFlow
            nodes={nodesForRender}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "#10b981", strokeWidth: 2.2 },
            }}
          >
            <MiniMap />
            <Controls />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.4}
              color="#86efac"
            />

            <Panel position="top-left">
              <AgentToolsPanel setNodes={setNodes} />
            </Panel>

            <Panel position="top-right">
              <SettingPanel setNodes={setNodes} />
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 p-4 bg-white border-t border-gray-200">
        <Button 
          onClick={SaveNodesAndEdges}
          className="gap-2 bg-black text-white hover:bg-gray-800"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default AgentBuilder;