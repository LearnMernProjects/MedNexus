import React from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MousePointer2, Pointer } from "lucide-react";
type AgentNodeData = {
  label?: string;
};

type AgentNodeType = Node<AgentNodeData>;

const AgentNode = ({ data }: NodeProps<AgentNodeType>) => {
  return (
    <div className="rounded-2xl border bg-white px-3 p-2">
      <div className="flex gap-2 items-center">
        <MousePointer2 className="p-2 rounded-lg h-8 w-8 bg-green-100" />
        <div className='flex flex-col'>
          <h2 className="text-sm font-semibold text-black">Agent</h2>
          <p className='text-xs text-gray-700'>Agent </p>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
      />
        
      <Handle
        type="source"
        position={Position.Right}
      />
    </div>
  );
};

export default AgentNode;