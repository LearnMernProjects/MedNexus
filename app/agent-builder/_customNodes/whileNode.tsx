import { Repeat } from 'lucide-react'
import React from 'react'
import { Handle, Position } from "@xyflow/react";
import { Input } from '@/components/ui/input';

const WhileNode = ({ data }: any) => {
  return (
    <div className='rounded-2xl bg-white p-3 px-3 border-2 border-blue-500'>
      <div className='flex gap-2 items-center'>
        <Repeat className='p-2 rounded-lg h-8 w-8' style={{ backgroundColor: data?.bgColor || '#E3F2FD' }} />
        <h2 className='text-sm font-medium'>While</h2>
      </div>
      <div className='max-w-56 flex flex-col gap-2 mt-2'>
        <Input placeholder='While condition' className='text-sm bg-white' disabled />
      </div>

      <Handle type='source' position={Position.Left} />
      <Handle type='target' position={Position.Right} />
    </div>
  )
}

export default WhileNode
