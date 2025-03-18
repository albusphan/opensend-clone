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

/**
 * Fetches the user profile
 */
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

/**
 * Fetches store information for a given store ID
 */
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

/**
 * Ensures permissions are calculated and stored in Redux
 */
function ensurePermissions(
  view: View,
  storeInfo: Store | null
): RoutePermissions {
  const perms = calculateAllowedRoutes(view, storeInfo);
  store.dispatch(setRoutePermissions(perms));
  return perms;
}

/**
 * Determines if a redirect is needed based on authentication state and current route
 * @param pathname The current route pathname
 * @returns Null if no redirect needed, or a string with the redirect path
 */
export async function getRedirectRoute(
  pathname: string
): Promise<string | null> {
  const state = store.getState();
  const { accessToken, view, storeInfo, routePermissions } = state.auth;
  const isLoginPage = pathname === "/login";

  // Case 1: Not authenticated and not on login page - redirect to login
  if (!accessToken && !isLoginPage) {
    return "/login";
  }

  // Case 2: Not authenticated and on login page - no redirect needed
  if (!accessToken && isLoginPage) {
    return null;
  }

  // Case 3: Authenticated but no user data yet - fetch profile and determine redirect
  if (accessToken && !view) {
    try {
      const profileData = await fetchUserProfile();
      let perms: RoutePermissions;

      // If client user with store access, fetch store info
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

      // If on login page, redirect to default route
      if (isLoginPage) {
        return perms.defaultRoute;
      }

      // If current route not allowed, redirect to default route
      if (!perms.allowedRoutes.includes(pathname)) {
        return perms.defaultRoute;
      }

      // Current route is allowed, no redirect needed
      return null;
    } catch (error) {
      // Profile fetch failed, redirect to login if not already there
      if (!isLoginPage) {
        return "/login";
      }
      return null;
    }
  }

  // Case 4: Authenticated with user data
  if (accessToken && view) {
    const perms = routePermissions || ensurePermissions(view, storeInfo);

    // If on login page, redirect to default route
    if (isLoginPage) {
      return perms.defaultRoute;
    }

    // If current route not allowed, redirect to default route
    if (!perms.allowedRoutes.includes(pathname)) {
      return perms.defaultRoute;
    }
  }

  // No redirect needed
  return null;
}
