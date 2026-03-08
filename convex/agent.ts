import {mutation, query} from "./_generated/server";
import {v} from "convex/values";
import {getAuthUserId} from "./auth";

export const CreateAgent = mutation({
    args:{
        agentId: v.string(),
        name: v.string(),
    userId:v.id('userTable')
    },
    handler:async(ctx,args)=>{
      
            const userId = await getAuthUserId(ctx);

            const result = await ctx.db.insert('AgentTable',{
                name:args.name,
                agentId: args.agentId,
                published: false,
                userId: args.userId,
            })
return result;
        }
            })
export const getUserAgents = query({
    args: {
    userId:v.id('userTable')
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.query('AgentTable').filter((q) => q.eq(q.field('userId'), args.userId)).order('desc').collect();
        return result
    }
    })
    export const GetAgentById = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("AgentTable").filter((q) => q.eq(q.field("agentId"), args.agentId)).order('desc').collect();
    return result[0];
  }
})
export const UpdateAgentDetails = mutation({
    args:{
        id:v.id('AgentTable'),
        name: v.optional(v.string()),
        nodes:v.any(),
        edges:v.any(),
    },
    handler:async(ctx,args)=>{
        await ctx.db.patch(args.id,{
            edges:args.edges,
            nodes:args.nodes
        })
    }
})
export const UpdateAgentToolConfig = mutation({
    args:{
        id:v.id('AgentTable'),
        agentToolConfig:v.any(),
    },
    handler:async(ctx,args)=>{
        await ctx.db.patch(args.id,{
            agentToolConfig:args.agentToolConfig
        })
    }
})