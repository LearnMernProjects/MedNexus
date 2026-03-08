import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const INDEX_BACKFILL_ERROR_TEXT = "Index userTable.by_clerkUserId is currently backfilling";

function isClerkUserIdIndexBackfilling(error: unknown) {
  const message = typeof error === "object" && error !== null && "message" in error
    ? String((error as { message?: unknown }).message)
    : String(error);
  return message.includes(INDEX_BACKFILL_ERROR_TEXT);
}

async function getUserByClerkUserIdWithFallback(ctx: any, clerkUserId: string) {
  try {
    return await ctx.db
      .query("userTable")
      .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", clerkUserId))
      .first();
  } catch (error) {
    if (!isClerkUserIdIndexBackfilling(error)) {
      throw error;
    }

    const allUsers = await ctx.db.query("userTable").collect();
    return allUsers.find((user: any) => user.clerkUserId === clerkUserId) ?? null;
  }
}

/**
 * Helper function to get the authenticated user ID from Clerk token
 */
export async function getAuthUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  // Clerk sends user ID in the 'sub' claim or 'user_id' claim
  return identity.subject || identity.user_id || identity.clerkUserId;
}

/**
 * Query to get the current user's auth identity
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user from database
    const user = await getUserByClerkUserIdWithFallback(ctx, userId);

    return user || null;
  },
});

/**
 * Mutation to create or update a user from Clerk
 */
export const createOrUpdateUser = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingUser = await getUserByClerkUserIdWithFallback(ctx, args.clerkUserId);

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name || existingUser.name,
        email: args.email || existingUser.email,
        imageUrl: args.imageUrl || existingUser.imageUrl,
      });
      return existingUser._id;
    } else {
      // Create new user
      const newUserId = await ctx.db.insert("userTable", {
        clerkUserId: args.clerkUserId,
        name: args.name || "User",
        email: args.email || "",
        password: "", // Not used with Clerk auth
        imageUrl: args.imageUrl || "",
        token: 0,
        createdAt: Date.now(),
      });
      return newUserId;
    }
  },
});

/**
 * Query to get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkUserIdWithFallback(ctx, args.clerkUserId);
    return user || null;
  },
});

