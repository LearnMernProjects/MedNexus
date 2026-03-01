'use client'
import { Button, Input } from '@base-ui/react'
import { Loader2Icon, Plus } from 'lucide-react'
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import  {v4 as uuidv4} from 'uuid';
import { useRouter } from 'next/dist/client/components/navigation'
import { useContext } from 'react'
import { UserDetailContext } from '@/app/context/UserDetailContext'
const CreateAgentSection = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const CreateAgentMutation=useMutation(api.agent.CreateAgent);
      const [agentName, setAgentName] = useState<string>("");
      const userDetail = useContext(UserDetailContext);
      const router=useRouter();
      const [loader, setLoader] = useState(false);

      const createAgent=async()=>{
        if (!userDetail?._id) return;
        setLoader(true);
        const agentId=uuidv4();
        await CreateAgentMutation({
            agentId: agentId,
            name: agentName ?? '',
            userId: userDetail._id as any,
        })
        setOpenDialog(false);
        setLoader(false);
        router.push('/agent-builder/'+agentId)
      }
  return (
    <div className='flex flex-col justify-center items-center mt-24 space-y-2'>
      <h2 className='font-bold text-2xl'>Create AI Agent</h2>
      <p className='text-lg '> Build A AI Agent Workflow with custom Logic and tools</p>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogTrigger asChild>
    <Button onClick={() => setOpenDialog(true)} className='flex flex-row p-3 text-md bg-black rounded-xl text-white shadow-2xl'><Plus/>Create </Button>
  </DialogTrigger>
  <DialogContent className='bg-white'>
    <DialogHeader>
      <DialogTitle>Enter Agent Name</DialogTitle>
      <DialogDescription>
        <Input placeholder='Agent Name' onChange={(event)=>{
            setAgentName(event.target.value)
        }} className='w-full border-2 border-gray-300 rounded-md p-2 mt-4'/>
      </DialogDescription>
    </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
    <Button className='bg-gray-200 p-2 text-black rounded-xl'>Cancel</Button>
    </DialogClose>
    <Button onClick={() => createAgent()} disabled={loader || !userDetail?._id} className='bg-black p-2 text-white rounded-xl'>Create</Button>
    {loader && <Loader2Icon className='animate-spin' />}
  </DialogFooter>
  </DialogContent>

</Dialog>
    </div>
  )
}

export default CreateAgentSection
