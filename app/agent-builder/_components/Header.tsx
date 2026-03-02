import React from 'react'
import { ChevronLeft, Code2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Agent } from '@/types/AgentType';
import Link from 'next/link';
import { X } from 'lucide-react';
type Props = {
    agentDetail: Agent;
    previewHeader?: boolean;
}
function Header  ({agentDetail, previewHeader=false }:Props) {
  return (
    <div className='w-full p-3 items-center justify-between flex'>
            <div className='gap-2 w-full flex items-center '>
                <ChevronLeft className='h-8 w-8'/>
                <h2 className='text-xl'>
                    {agentDetail?.name}
                </h2>
            </div>

            <div className='flex items-center justify-center gap-3'>
                <Button variant={'ghost'}>
                    <Code2 />
                    Code
                </Button>

                {!previewHeader? <Link href={`/agent-builder/${agentDetail.agentId}/preview`}>
                    <Button className='bg-black text-sm text-white'>
                        <Play />
                        Preview
                    </Button>
                </Link> : <Link href={`/agent-builder/${agentDetail.agentId}`}>
                    <Button className='bg-black text-sm text-white'>
                        <X className='h-4 w-4 mr-2'/>
                       Close Preview
                    </Button>
                </Link>}

                <Button>Publish</Button>
            </div>
        </div>
  )
}

export default Header;
