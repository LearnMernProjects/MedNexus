import React from 'react'
import { Square } from 'lucide-react'   

import { Handle, Position, NodeProps } from "@xyflow/react";
const EndNode = ({data}:any) => {
   return (
    <div className='bg-white rounded-2xl p-2 px-2 border'>
      <div className='flex gap-2 items-center'>
        <Square className='p-2 rounded-lg h-8 w-8 '
        style={{backgroundColor:data?.bgColor}}/>
        <h2>End Node</h2>
      </div>
      <Handle type='target' position={Position.Right} />
    </div>
  )
}

export default EndNode
