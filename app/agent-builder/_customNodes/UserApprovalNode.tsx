import React from 'react'
import { ThumbsUp } from 'lucide-react'   

import { Handle, Position, NodeProps } from "@xyflow/react";

import { Button } from '@/components/ui/button';
const handleStyle = {
    top:30,
}
function UserApprovalNode  ({data}:any) {

  return (
    <div className='rounded-2xl bg-white p-3 px-3 border'>
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
