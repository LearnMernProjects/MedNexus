import React from 'react'
import { Merge, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Handle, Position } from '@xyflow/react'

const IfElseNode = ({ id, data }: any) => {
  const handleStyle = {
    top: 10
  }
  return (
    <div className='relative rounded-2xl bg-white p-3 px-3 border-2 border-yellow-500'>
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
        <Merge className='p-2 rounded-lg h-8 w-8' style={{ backgroundColor: data?.bgColor || '#FFF3CD' }} />
        <h2 className='text-sm font-medium'>If/Else</h2>
      </div>
      <div className='max-w-56 flex flex-col gap-2 mt-2'>
        <Input
          placeholder='If condition'
          className='text-sm bg-white'
          value={data?.settings?.ifCondition ?? ''}
          readOnly
        />
        <Input
          placeholder='Else condition'
          className='text-sm bg-white'
          value={data?.settings?.elseCondition ?? ''}
          readOnly
        />
      </div>

      <Handle type='target' position={Position.Left} id='target' style={handleStyle} />
      <Handle type='source' position={Position.Right} id='if' />
      <Handle type='source' position={Position.Right} id='else' style={{ top: 50 }} />
    </div>
  )
}

export default IfElseNode
