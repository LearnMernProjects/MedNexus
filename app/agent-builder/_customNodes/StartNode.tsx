import React from 'react'
import { Play } from 'lucide-react'   

import { Handle, Position, NodeProps } from "@xyflow/react";
const StartNode = () => {
  return (
    <div className='bg-white rounded-2xl p-2 px-2 border'>
      <div className='flex gap-2 items-center'>
        <Play className='p-2 rounded-lg h-8 w-8 bg-yellow'/>
        <h2>Start Node</h2>
      </div>
      <Handle type='source' position={Position.Right} />
    </div>
  )
}

export default StartNode
