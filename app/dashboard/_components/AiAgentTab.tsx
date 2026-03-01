import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MyAgents from './MyAgents'
const AiAgentTab = () => {
  return (
    <div className='w-full h-full bg-white rounded-lg shadow-md px-10 md:px-24 lg:px-32 mt-20 font-bold'    >
    
      <Tabs defaultValue="MyAgents" className="w-full">
  <TabsList>
    <TabsTrigger value="MyAgents">My Agents</TabsTrigger>
    <TabsTrigger value="Templates">Templates</TabsTrigger>
  </TabsList>
  <TabsContent value="MyAgents"><MyAgents/></TabsContent>
  <TabsContent value="Templates">Change your templates here.</TabsContent>
</Tabs>
    </div>
  )
}

export default AiAgentTab
