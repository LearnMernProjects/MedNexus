import React from 'react'
import { Webhook, X } from 'lucide-react'
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
const ApiNode = ({ id, data }:any) => {
  return (
    <div className="relative rounded-2xl border bg-white px-3 p-2">
      <button
        type="button"
        className="nodrag nopan absolute -top-2 -right-2 h-5 w-5 rounded-full border bg-white flex items-center justify-center hover:bg-gray-100"
        onClick={(event) => {
          event.stopPropagation();
          data?.onDelete?.(id);
        }}
        aria-label="Delete node"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="flex gap-2 items-center">
        <Webhook className="p-2 rounded-lg h-8 w-8" style={{ backgroundColor: data?.bgColor || '#D1F0FF' }} />
        <div className='flex flex-col'>
          <h2 className="text-sm font-semibold text-black">{data?.label}</h2>
          <p className='text-xs text-gray-700'>API </p>
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
}

export default ApiNode


