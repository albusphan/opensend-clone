import {
  Link,
  Outlet,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
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
import { Button } from "@/components/ui/button";

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
    const state = store.getState();
    const { accessToken, view, storeInfo, routePermissions } = state.auth;
    const isLoginPage = location.pathname === "/login";

    if (!accessToken && !isLoginPage) {
      throw redirect({
        to: "/login",
      });
    }

    if (!accessToken && isLoginPage) {
      return;
    }

    if (accessToken && !view) {
      let profileData: UserProfileResponse | null = null;

      try {
        profileData = await fetchUserProfile();
      } catch (error) {
        if (!isLoginPage) {
          throw redirect({
            to: "/login",
          });
        }
        return;
      }

      let perms: RoutePermissions;

      if (
        profileData.view?.type === "CLIENT" &&
        profileData.accesses?.length > 0
      ) {
        const storeId = String(profileData.accesses[0].store_id);

        try {
          const storeData = await fetchStoreInfo(storeId);
          perms = ensurePermissions(profileData.view, storeData);
        } catch (error) {
          perms = ensurePermissions(profileData.view, null);
        }
      } else {
        perms = ensurePermissions(profileData.view, null);
      }

      if (isLoginPage) {
        throw redirect({
          to: perms.defaultRoute,
        });
      }

      if (!perms.allowedRoutes.includes(location.pathname)) {
        throw redirect({
          to: perms.defaultRoute,
        });
      }
    }

    if (accessToken && view) {
      const perms = routePermissions || ensurePermissions(view, storeInfo);

      if (isLoginPage) {
        throw redirect({
          to: perms.defaultRoute,
        });
      }

      if (!perms.allowedRoutes.includes(location.pathname)) {
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

  const { view } = useAppSelector((state) => state.auth);
  const isAdmin = view?.type === "ADMIN";

  return (
    <div className="bg-background min-h-screen">
      <div className="flex p-4 justify-between items-center border-b">
        <div className="flex gap-4 items-center">
          <div className="text-xl font-bold">
            <img src="/logo-full.svg" alt="OpenSend" className="h-6" />
          </div>
          {isAdmin && (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/admin">Admin</Link>
              </Button>
            </>
          )}
        </div>
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
    </div>
  );
}
