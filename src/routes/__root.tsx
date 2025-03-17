import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAppSelector } from "@/lib/redux/hooks";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { store } from "@/lib/redux/store";
import { api } from "@/lib/redux/api";
import {
  setUserData,
  setStoreInfo,
  setRoutePermissions,
} from "@/lib/redux/authSlice";
import { calculateAllowedRoutes } from "@/lib/utils/routes";
import type { View, Store, UserProfileResponse } from "@/lib/redux/api";
import type { RoutePermissions } from "@/lib/utils/routes";

// Helper function to fetch user profile
async function fetchUserProfile() {
  return new Promise<UserProfileResponse>(async (resolve, reject) => {
    try {
      const profile = await store
        .dispatch(
          api.endpoints.getUserProfile.initiate(undefined, {
            forceRefetch: true,
          })
        )
        .unwrap();

      store.dispatch(
        setUserData({
          user: profile.user,
          view: profile.view,
          accesses: profile.accesses,
        })
      );

      resolve(profile);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      reject(error);
    }
  });
}

// Helper function to fetch store info
async function fetchStoreInfo(storeId: string) {
  return new Promise<Store>(async (resolve, reject) => {
    try {
      const storeData = await store
        .dispatch(
          api.endpoints.getStoreInfo.initiate(storeId, {
            forceRefetch: true,
          })
        )
        .unwrap();

      store.dispatch(setStoreInfo(storeData));
      resolve(storeData);
    } catch (error) {
      console.error("Failed to fetch store info", error);
      reject(error);
    }
  });
}

// Helper function to ensure permissions are calculated
function ensurePermissions(
  view: View,
  storeInfo: Store | null
): RoutePermissions {
  const perms = calculateAllowedRoutes(view, storeInfo);
  store.dispatch(setRoutePermissions(perms));
  return perms;
}

export const Route = createRootRoute({
  component: RootComponent,

  beforeLoad: async ({ location }) => {
    console.log("beforeLoad running for path:", location.pathname);
    const state = store.getState();
    const { accessToken, view, storeInfo, routePermissions } = state.auth;
    const isLoginPage = location.pathname === "/login";

    // Case 1: No token and not on login page -> redirect to login
    if (!accessToken && !isLoginPage) {
      console.log("No token, redirecting to login");
      throw redirect({
        to: "/login",
      });
    }

    // Case 2: No token and on login page -> show login page
    if (!accessToken && isLoginPage) {
      return;
    }

    // Case 3: Has token but no view data -> fetch profile
    if (accessToken && !view) {
      console.log("Has token but no profile, fetching profile");

      let profileData: UserProfileResponse | null = null;

      try {
        profileData = await fetchUserProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Handle profile fetch failure - only redirect if not on login
        if (!isLoginPage) {
          throw redirect({
            to: "/login",
          });
        }
        return; // Stay on login page
      }

      // We have profile data at this point
      let perms: RoutePermissions;

      // For client users with accesses, try to fetch store info
      if (
        profileData.view?.type === "CLIENT" &&
        profileData.accesses?.length > 0
      ) {
        const storeId = String(profileData.accesses[0].store_id);

        try {
          const storeData = await fetchStoreInfo(storeId);
          perms = ensurePermissions(profileData.view, storeData);
        } catch (error) {
          // If store fetch fails, calculate permissions without store
          perms = ensurePermissions(profileData.view, null);
        }
      } else {
        // For non-client users or clients without access
        perms = ensurePermissions(profileData.view, null);
      }

      // Now we have permissions, determine where to redirect
      if (isLoginPage) {
        console.log("Redirecting from login to:", perms.defaultRoute);
        throw redirect({
          to: perms.defaultRoute,
        });
      }

      // If on a non-allowed page, redirect
      if (!perms.allowedRoutes.includes(location.pathname)) {
        console.log("Not allowed, redirecting to:", perms.defaultRoute);
        throw redirect({
          to: perms.defaultRoute,
        });
      }
    }

    // Case 4: Has token and view data
    if (accessToken && view) {
      console.log("Has token and view, checking permissions");

      // Get or calculate permissions
      const perms = routePermissions || ensurePermissions(view, storeInfo);

      // Handle routing based on permissions
      if (isLoginPage) {
        console.log(
          "On login with token and view, redirecting to:",
          perms.defaultRoute
        );
        throw redirect({
          to: perms.defaultRoute,
        });
      }

      if (!perms.allowedRoutes.includes(location.pathname)) {
        console.log("Route not allowed, redirecting to:", perms.defaultRoute);
        throw redirect({
          to: perms.defaultRoute,
        });
      }
    }
  },
});

function RootComponent() {
  const { isCheckingAuth } = useAuthCheck();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-background min-h-screen">
      <div className="flex p-4 justify-between items-center border-b">
        <div className="text-xl font-bold">OpenSend Clone</div>
        <div className="flex items-center gap-2">
          {user && <LogoutButton />}
          <ThemeToggle />
        </div>
      </div>
      <main className="container mx-auto p-4">
        {isCheckingAuth ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Toaster />
      <TanStackRouterDevtools />
    </div>
  );
}
