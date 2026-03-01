import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { de } from "date-fns/locale";
import { query } from "./_generated/server";

export default defineSchema({
  userTable: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    imageUrl: v.string(),
    subscription: v.optional(v.string()),
    token: v.number(),
    createdAt: v.number(),
    clerkUserId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_clerkUserId", ["clerkUserId"]),

  AgentTable:defineTable({
    agentId: v.string(),
    name: v.string(),
    config: v.optional(v.any()),
    nodes:v.optional(v.any()),
    edges:v.optional(v.any()),
    published: v.boolean(),
    userId:v.optional(v.id('userTable'))
  })
    .index("by_name", ["name"])
    .index("by_agentId", ["agentId"]),
});
