import React from 'react'
import { ThumbsUp, X } from 'lucide-react'   

import { Handle, Position, NodeProps } from "@xyflow/react";

import { Button } from '@/components/ui/button';
const handleStyle = {
    top:30,
}
function UserApprovalNode  ({ id, data }:any) {

  return (
    <div className='relative rounded-2xl bg-white p-3 px-3 border'>
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
        <ThumbsUp className='p-2 rounded-lg h-8 w-8' style={{ backgroundColor: data?.bgColor || '#FFF3CD' }} />
        <h2>User Approval</h2>
        <h2 className='text-sm font-medium'>If/Else</h2>
      </div>
      <div className='max-w-[140px] flex flex-col gap-2 mt-2'>
<Button variant={"outline"} disabled>Approve</Button>
<Button variant={"outline"} disabled> Reject</Button>
      </div>

      <Handle type='target' position={Position.Left}  />
      <Handle type='source' position={Position.Right} id={'approve'} />
      <Handle type='source' position={Position.Right} id={'reject'} style={handleStyle} />
    </div>
  )
}

export default UserApprovalNode;
