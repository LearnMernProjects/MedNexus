'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Handle, Position, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useConvex } from 'convex/react';
import { RefreshCwIcon, Square } from 'lucide-react';
import Header from '../../_components/Header';
import StartNode from '../../_customNodes/StartNode';
import AgentNode from '../../_customNodes/AgentNode';
import IfElseNode from '../../_customNodes/ifElseNode';
import WhileNode from '../../_customNodes/whileNode';
import ApiNode from '../../_customNodes/ApiNode';
import UserApprovalNode from '../../_customNodes/UserApprovalNode';
import { useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';
import { RefreshCcwIcon } from 'lucide-react';
import ChatUi from './_components/ChatUi';
import PublishCodeDialog from './_components/PublishCodeDialog';
import { opendir } from 'fs';
import { set } from 'zod';
type AgentDetail = Doc<'AgentTable'> & {
  nodes?: any[];
  edges?: any[];
  agentToolConfig?: any;
};

const EndNode = () => (
  <div className='bg-white rounded-2xl p-2 px-3 border-2 border-red-500'>
    <div className='flex gap-2 items-center'>
      <Square className='p-2 rounded-lg h-8 w-8 bg-red-100' />
      <h2 className='text-sm font-medium'>End</h2>
      <Handle type='target' position={Position.Left} />
    </div>
  </div>
);

const nodeTypes = {
  StartNode,
  AgentNode,
  EndNode,
  ifElseNode: IfElseNode,
  IfElseNode,
  whileNode: WhileNode,
  WhileNode,
  apiNode: ApiNode,
  ApiNode,
  UserApprovalNode,
};

const PreviewAgent = () => {
  const convex = useConvex();
  const params = useParams();
  const agentIdParam = params?.agentId;
  const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;
const [conversationId, setConversationId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [flowConfig, setFlowConfig] = useState<any>(null);
  const [agentDetail, setAgentDetail] = useState<AgentDetail | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
const updateAgentToolConfig = useMutation((api as any).agent.UpdateAgentToolConfig);

  useEffect(() => {
    if (!agentId) return;

    let cancelled = false;

const GetAgentDetail = async () => {
  try {
    const result = await convex.query(api.agent.GetAgentById as any, { agentId } as any);
    if (!cancelled) setAgentDetail(result as AgentDetail);
  } catch (error) {
    console.error('Failed to fetch agent detail:', error);
  }
};

const getConversationId = async () => {
  const conversationIdResult = await axios.get('/api/agent-chat');
  console.log('Conversation ID response:', conversationIdResult.data);
  setConversationId(conversationIdResult.data.conversationId);
};

GetAgentDetail();
getConversationId();

    return () => {
      cancelled = true;
    };
  }, [convex, agentId]);

  const config = useMemo(() => {
    const nodes = agentDetail?.nodes ?? [];
    const edges = agentDetail?.edges ?? [];

    const edgeMap = edges.reduce((acc: Record<string, any[]>, edge: any) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge);
      return acc;
    }, {});

    const flow = nodes.map((node: any) => {
      const connectedEdges = edgeMap[node.id] || [];
      let next: any = null;

      switch (node.type) {
        case 'ifElseNode':
        case 'IfElseNode': {
          const ifEdge = connectedEdges.find((e: any) => e.sourceHandle === 'if');
          const elseEdge = connectedEdges.find((e: any) => e.sourceHandle === 'else');
          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null,
          };
          break;
        }

        case 'EndNode': {
          next = null;
          break;
        }

        default: {
          if (connectedEdges.length === 1) next = connectedEdges[0].target;
          else if (connectedEdges.length > 1) next = connectedEdges.map((e: any) => e.target);
          break;
        }
      }

      return {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        settings: node.data?.settings || {},
        next,
      };
    });

    const startNode = nodes.find((n: any) => n.type === 'StartNode');

    return {
      startNode: startNode?.id || null,
      flow,
    };
  }, [agentDetail]);

  useEffect(() => {
    if (agentDetail) {
      console.log('✅ Generated Workflow Config:', config);
      console.log(
        '🧩 Raw Nodes Data:',
        (agentDetail.nodes ?? []).map((n: any) => ({
          id: n.id,
          type: n.type,
          data: n.data,
        }))
      );
      setFlowConfig(config);
    }
  }, [agentDetail, config]);

  const GenerateAgentConfig = async () => {
    setLoading(true);
    try {
      console.log('📤 Payload to /api/arcjet/generate-agent-tool-config:', { jsonConfig: config });

      const result = await axios.post('/api/arcjet/generate-agent-tool-config', {
        jsonConfig: config,
      });

      console.log('✅ Agent Config Generation Response:', result.data);
      await updateAgentToolConfig({
        id: agentDetail?._id as any,
        agentToolConfig: result.data,
      });
      setAgentDetail((prev) => prev ? { ...prev, agentToolConfig: result.data } : prev);
    } catch (error) {
      const details = axios.isAxiosError(error)
        ? (error.response?.data?.details ?? error.response?.data?.error ?? error.message)
        : String(error);
      console.error('❌ Error generating agent config:', details);
    } finally {
      setLoading(false);
    }
  };
const OnPublish = () =>{
  setOpenDialog(true);

}
  return (
    <div>
      {agentDetail && <Header previewHeader={true} agentDetail={agentDetail} 
      onPublish={OnPublish}/>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 p-5">
        <div className="lg:col-span-3 border rounded-2xl p-5 min-h-[78vh]">
          <div className="mb-3 font-medium">Preview</div>
          <div className="h-[70vh] w-full rounded-xl bg-green-50 overflow-hidden">
            <ReactFlow
              nodes={agentDetail?.nodes ?? []}
              edges={agentDetail?.edges ?? []}
              nodeTypes={nodeTypes}
              fitView
              draggable={false}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: '#10b981', strokeWidth: 2.2 },
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-1 border rounded-2xl p-5 min-h-[78vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            {!agentDetail?.agentToolConfig && (
              <Button onClick={GenerateAgentConfig} disabled={loading} className="bg-black text-white">
                <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
                ReBoot agent
              </Button>
            )}
          </div>

          <h3 className="font-semibold mb-2">Workflow Config</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[22vh]">
            {JSON.stringify(flowConfig ?? config, null, 2)}
          </pre>
          <div className='col-span-1 border rounded-2xl m-5'>
          {agentDetail?.agentToolConfig && <div className='p-5 flex flex-col gap-5'>

        <Button
          onClick={GenerateAgentConfig}
          disabled={loading}
        >
          <RefreshCcwIcon className={`${loading && 'animate-spin'}`} />
        </Button>
      </div>}
      {agentDetail && <ChatUi 
      conversationId={conversationId} agentDetail={agentDetail} GenerateAgentToolConfig={GenerateAgentConfig} loading={loading} />}
          </div>
        </div>
      </div>
      <PublishCodeDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </div>
  );
};

export default PreviewAgent;