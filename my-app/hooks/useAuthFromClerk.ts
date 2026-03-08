import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

/**
 * Hook to handle Clerk authentication with Convex
 * Provides a fetchAccessToken function that Convex can use
 */
export function useAuthFromClerk() {
  const { getToken, isSignedIn } = useAuth();

  const fetchAccessToken = useCallback(
    async (forceRefresh?: boolean) => {
      if (!isSignedIn) {
        return null;
      }

      try {
        // Use Clerk's getToken method to get a JWT token
        // The "convex" template needs to be created in Clerk dashboard
        const token = await getToken({
          template: "convex",
          skipCache: forceRefresh || false,
        });
        return token;
      } catch (error) {
        console.error("Error fetching Convex token from Clerk:", error);
        return null;
      }
    },
    [getToken, isSignedIn]
  );

  return {
    isAuthenticated: isSignedIn,
    fetchAccessToken,
  };
}
