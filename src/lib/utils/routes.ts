import type { View, Store } from "@/lib/redux/api";

export interface RoutePermissions {
  allowedRoutes: string[];
  defaultRoute: string;
}

/**
 * Calculate the allowed routes for a user based on their type and onboarding status
 */
export function calculateAllowedRoutes(
  view: View | null,
  storeInfo: Store | null
): RoutePermissions {
  // No view means not authenticated
  if (!view) {
    return {
      allowedRoutes: ["/login"],
      defaultRoute: "/login",
    };
  }

  // Admin users - they should access /admin (primary) and /dashboard (for widget editing)
  if (view.type === "ADMIN") {
    return {
      allowedRoutes: ["/admin", "/dashboard"],
      defaultRoute: "/admin",
    };
  }

  // Client users
  if (view.type === "CLIENT") {
    // Check if store exists and onboarding status
    if (storeInfo) {
      // Use the path to onboarding_status from your actual Store type
      const onboardingStatus =
        storeInfo.store?.onboarding_procedure?.onboarding_status;
      const storeId = String(storeInfo.store?.id);

      if (onboardingStatus !== "DONE") {
        return {
          allowedRoutes: ["/onboarding"],
          defaultRoute: `/onboarding?storeId=${storeId}`,
        };
      } else {
        return {
          allowedRoutes: ["/dashboard"],
          defaultRoute: "/dashboard",
        };
      }
    }

    // Default for clients with no store yet
    return {
      allowedRoutes: ["/dashboard"],
      defaultRoute: "/dashboard",
    };
  }

  // Default fallback
  return {
    allowedRoutes: ["/login"],
    defaultRoute: "/login",
  };
}
