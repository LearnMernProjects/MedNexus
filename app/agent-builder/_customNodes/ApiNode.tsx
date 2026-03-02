import React from 'react'
import { Webhook } from 'lucide-react'
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
const ApiNode = ({data}:any) => {
  return (
    <div className="rounded-2xl border bg-white px-3 p-2">
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


