import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const GetConversationById = query({
    args: {
        agentId: v.id("AgentTable"),
        userId: v.id("userTable"),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("ConversationTable")
            .filter((q) =>
                q.and(
                    q.eq(q.field("agentId"), args.agentId),
                    q.eq(q.field("userId"), args.userId)
                )
            )
            .collect();

        return result[0];
    },
});

export const CreateConversation = mutation({
    args: {
        conversationId: v.string(),
        agentId: v.id("AgentTable"),
        userId: v.id("userTable"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("ConversationTable")
            .filter((q) =>
                q.and(
                    q.eq(q.field("agentId"), args.agentId),
                    q.eq(q.field("userId"), args.userId)
                )
            )
            .collect();

        if (existing[0]) {
            return existing[0];
        }

        const id = await ctx.db.insert("ConversationTable", {
            conversationId: args.conversationId,
            agentId: args.agentId,
            userId: args.userId,
        });

        return await ctx.db.get(id);
    },
});
    