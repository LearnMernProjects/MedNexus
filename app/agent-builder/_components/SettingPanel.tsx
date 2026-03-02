'use client'

import React from 'react'
import AgentSettings from '../_nodeSettings/AgentSettings'
import { useWorkflow } from "@/app/context/WorkflowContext";
import EndSetting from '../_nodeSettings/EndSetting';
import WhileSettings from '../_nodeSettings/WhileSettings';
import IfElseSettings from '../_nodeSettings/ifElseSettings';
import UserApproval from '../_nodeSettings/UserApproval';
import ApiAgentSettings from '../_nodeSettings/ApiSettings';
const SettingPanel = ({ setNodes }: any) => {
  const { selectedNode, setAddedNodes, setSelectedNode } = useWorkflow()
const onUpdateNodeData = (formData: any) => {
  if (!selectedNode) return;

  const updateNode={
    ...selectedNode,
    data: {
      ...selectedNode?.data,
      ...formData,
      label: formData?.name ?? selectedNode?.data?.label,
      setting: formData,
    },
    label: formData.name,
    setting: formData
  }
  console.log(updateNode)
  setAddedNodes((prevNodes:any) =>
    prevNodes.map((node:any) =>
      node.id === selectedNode?.id ? updateNode : node 
    )
  );

  setNodes?.((prevNodes:any) =>
    prevNodes.map((node:any) =>
      node.id === selectedNode?.id ? updateNode : node
    )
  );

  setSelectedNode?.(updateNode as any);
}
  return (
    <div className="bg-white p-5 rounded-2xl w-[350px] shadow">
      {selectedNode?.type === 'AgentNode' && <AgentSettings selectedNode={selectedNode}
      updateFormData={(value:any)=>onUpdateNodeData(value)} />}

      {selectedNode?.type === 'EndNode' && <EndSetting selectedFormData={selectedNode?.data?.setting} updateFormData={(value:any)=>onUpdateNodeData(value)} />}

      {selectedNode?.type === 'IfElse' && <IfElseSettings selectedNode={selectedNode} updateFormData={(value:any)=>onUpdateNodeData(value)} />}
        {selectedNode?.type === 'WhileNode' && <WhileSettings selectedNode={selectedNode} updateFormData={(value:any)=>onUpdateNodeData(value)} />}
                  {selectedNode?.type === 'UserApprovalNode' && <UserApproval selectedNode={selectedNode} updateFormData={(value:any)=>onUpdateNodeData(value)} />}
                    {(selectedNode?.type === 'apiNode' || selectedNode?.type === 'ApiNode') && <ApiAgentSettings selectedNode={selectedNode} updateFormData={(value:any)=>onUpdateNodeData(value)} /> }

    </div>
  )
}

export default SettingPanel