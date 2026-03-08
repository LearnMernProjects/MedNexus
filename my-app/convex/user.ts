import {v} from "convex/values";
import {mutation} from "./_generated/server";

const INDEX_BACKFILL_ERROR_TEXT = "Index userTable.by_clerkUserId is currently backfilling";

function isClerkUserIdIndexBackfilling(error: unknown) {
    const message = typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);
    return message.includes(INDEX_BACKFILL_ERROR_TEXT);
}

async function getUserByClerkUserIdWithFallback(ctx: any, clerkUserId?: string) {
    if (!clerkUserId) return null;

    try {
        return await ctx.db
            .query('userTable')
            .withIndex('by_clerkUserId', (q: any) => q.eq('clerkUserId', clerkUserId))
            .first();
    } catch (error) {
        if (!isClerkUserIdIndexBackfilling(error)) {
            throw error;
        }

        const allUsers = await ctx.db.query('userTable').collect();
        return allUsers.find((user: any) => user.clerkUserId === clerkUserId) ?? null;
    }
}

const CreateNewUser = mutation({
    args:{
        name:v.string(),
        email:v.string(),
        imageUrl: v.optional(v.string()),
        clerkUserId: v.optional(v.string()),
    },
    handler:async(ctx,args)=>{
        try {
            // Check if user already exists by Clerk ID first, then by email
            const existingUserByClerkId = await getUserByClerkUserIdWithFallback(ctx, args.clerkUserId);

            const existingUserByEmail = await ctx.db
                .query('userTable')
                .withIndex('by_email', (q) => q.eq('email', args.email))
                .first();

            const existingUser = existingUserByClerkId || existingUserByEmail;
            
            if(existingUser) {
                // Update existing user
                await ctx.db.patch(existingUser._id, {
                    name: args.name,
                    email: args.email,
                    imageUrl: args.imageUrl || existingUser.imageUrl,
                    clerkUserId: args.clerkUserId || existingUser.clerkUserId || "",
                });
                return existingUser;
            } else {
                // Create new user
                const userData = {
                    name: args.name,
                    email: args.email,
                    token: 5000,
                    password: "",
                    imageUrl: args.imageUrl || "",
                    createdAt: Date.now(),
                    clerkUserId: args.clerkUserId || "",
                };
                const result = await ctx.db.insert('userTable', userData);
                return { ...userData, _id: result };
            }
        } catch (error) {
            console.error("Error creating/updating user:", error);
            throw error;
        }
    }
});
    
export default CreateNewUser;