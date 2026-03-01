import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CreateAgentSection from "./_components/CreateAgentSection";
import AiAgentTab from "./_components/AiAgentTab";

function Dashboard() {
    return (
        <div className="w-full min-h-screen p-6">
          <CreateAgentSection/>
          <AiAgentTab/>
        </div>
    )
}   
export default Dashboard;