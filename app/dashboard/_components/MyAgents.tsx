'use client'
import { UserDetailContext } from '@/app/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/dist/client/components/navigation';
import { Agent } from '@/types/AgentType';
import { GitBranchPlus } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

const MyAgents = () => {
    const userDetail = useContext(UserDetailContext);
    const [agentList, setAgentList] = useState<Agent[]>([]);
    const convex=useConvex();
    useEffect(()=>{
        userDetail && getUserAgents();
    },[userDetail])
    const getUserAgents=async()=>{
        if(userDetail?._id) {
            const result=await convex.query(api.agent.getUserAgents,{userId: userDetail._id as any});
            console.log(result);
            setAgentList(result);
        }
    }
   return (
    <div className="w-full bg-white">
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agentList && agentList.map((agent: Agent) => (
          <Link
            href={'/agent-builder/' + agent.agentId}
            key={agent.agentId}
            className="block w-full min-h-[160px] p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
          >
            <GitBranchPlus className="bg-yellow-100 p-1 w-10 h-10 rounded-md" />
            <h2 className="font-bold mt-3 w-full text-black truncate">{agent.name}</h2>
            <h2 className="text-gray-400 text-sm mt-2">
              {moment(agent._creationTime).fromNow()}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MyAgents
