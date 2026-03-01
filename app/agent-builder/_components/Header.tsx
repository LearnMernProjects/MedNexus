import React from 'react'
import { ChevronLeft, Code2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Agent } from '@/types/AgentType';
type Props = {
    agentDetail: Agent;
}
function Header  ({agentDetail}:Props) {
  return (
    <div className='w-full p-3 items-center justify-between flex'>
        <div className='gap-2 w-full flex items-center '>
            <ChevronLeft className='h-8 w-8'/>
            <h2 className='text-xl'>
                {agentDetail?.name}
            </h2>

        </div>
 <div className='flex items-center justify-center gap-3'>
    <Button variant={'ghost'}> <Code2/>Code </Button>
    <Button className='bg-black text-sm text-white'>
        <Play/>
        Preview</Button>
        <Button>Publish</Button></div></div>
  )
}

export default Header;
