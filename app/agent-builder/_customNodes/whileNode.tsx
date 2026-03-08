import { Repeat, X } from 'lucide-react'
import React from 'react'
import { Handle, Position } from "@xyflow/react";
import { Input } from '@/components/ui/input';

const WhileNode = ({ id, data }: any) => {
  return (
    <div className='relative rounded-2xl bg-white p-3 px-3 border-2 border-blue-500'>
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
