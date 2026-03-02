'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { useConvex } from 'convex/react';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';

type AgentDetail = Doc<'AgentTable'> & {
  nodes?: any[];
  edges?: any[];
  agentToolConfig?: any;
};

const FallbackNode = ({ data }: any) => (
  <div className="px-4 py-2 bg-white border rounded-md text-sm shadow-sm min-w-[120px] text-center">
    {data?.label || 'Node'}
  </div>
);
type HeaderProps = {
  previewHeader?: boolean;
  agentDetail?: any;
};
const PreviewAgent = () => {
  const convex = useConvex();
  const params = useParams();
  const agentIdParam = params?.agentId;
  const agentId = Array.isArray(agentIdParam) ? agentIdParam[0] : agentIdParam;

  const [loading, setLoading] = useState(false);
  const [flowConfig, setFlowConfig] = useState<any>(null);
  const [agentDetail, setAgentDetail] = useState<AgentDetail | null>(null);

  const nodeTypes = useMemo(
    () => ({
      StartNode: FallbackNode,
      AgentNode: FallbackNode,
      IfElseNode: FallbackNode,
      ApiNode: FallbackNode,
      EndNode: FallbackNode,
    }),
    []
  );

  useEffect(() => {
    if (!agentId) return;

    let cancelled = false;

    const getAgentDetail = async () => {
      try {
        const result = await convex.query(api.agent.GetAgentById as any, { agentId } as any);
        if (!cancelled) setAgentDetail(result as AgentDetail);
      } catch (error) {
        console.error('Failed to fetch agent detail:', error);
      }
    };

    getAgentDetail();

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
      console.log('📤 Payload to /api/generate-agent-tool-config:', { jsonConfig: config });

      const response = await axios.post('/api/generate-agent-tool-config', {
        jsonConfig: config,
      });

      console.log('✅ Agent Config Generation Response:', response.data);
    } catch (error) {
      console.error('❌ Error generating agent config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {agentDetail && <Header previewHeader={true} agentDetail={agentDetail} />}

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
        </div>
      </div>
    </div>
  );
};

export default PreviewAgent;