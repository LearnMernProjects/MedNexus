import React from "react";
import MyAgents from "../_components/MyAgents";

function MyAgentsPage() {
  return (
    <div className="w-full min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">AI Agents</h1>
      <MyAgents />
    </div>
  );
}

export default MyAgentsPage;
