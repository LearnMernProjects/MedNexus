import { id } from 'date-fns/locale';
import { MousePointer, Square, ArrowRight, Repeat, ThumbsUp, Webhook, Merge } from 'lucide-react';
import React from 'react';

const AgentTools = [
  {
    name: 'Agent',
    icon: MousePointer,
    bgColor: '#C0F2D7',
    type: 'AgentNode',
  },
  {
    name: 'End',
    icon: Square,
    bgColor: '#FF6B6B',
    type: 'EndNode',
  },
  {
    name: 'If/Else',
    icon: Merge,
    bgColor: '#FFF3CD',
    type: 'ifElseNode',
    id: 'ifElse',
  },
  {
    name: 'While',
    icon: Repeat,
    bgColor: '#E3F2FD',
    type: 'whileNode',
    id: 'while',
  },
  {
    name: 'User Approval',
    icon: ThumbsUp,
    bgColor: '#EADCFB',
    type: 'UserApprovalNode',
    id: 'approval',
  },
  {
    name: 'API',
    icon: Webhook,
    bgColor: '#D1F0FF',
    type: 'apiNode',
  },
];

interface AgentToolsPanelProps {
  setNodes: (updater: (prev: any[]) => any[]) => void;
}

const AgentToolsPanel = ({ setNodes }: AgentToolsPanelProps) => {
  const onAgentToolClick = (tool: any) => {
    const newNode = {
      id: `${tool.type}-${Date.now()}`,
      type: tool.type,
      data: { label: tool.name, bgColor: tool.bgColor, id: `${tool.type}-${Date.now()}`, type: tool.type },
      position: { x: Math.random() * 400, y: Math.random() * 300 },
    };
    setNodes((prev: any) => [...prev, newNode]);
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow">
      <h2 className="font-semibold mb-4">{AgentTools[0]?.name}</h2>

      <div>
        {AgentTools.map((tool, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded-xl"
            onClick={() => onAgentToolClick(tool)}
          >
            <tool.icon
              className="p-2 rounded-lg h-8 w-8"
              style={{ backgroundColor: tool.bgColor }}
            />
            <h2 className="text-sm mt-1 font-md text-gray-700">{tool.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentToolsPanel;