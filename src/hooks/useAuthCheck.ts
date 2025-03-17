import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useGetUserProfileQuery, useGetStoreInfoQuery } from "@/lib/redux/api";
import {
  setUserData,
  logout,
  markInitialized,
  setStoreInfo,
  setRoutePermissions,
} from "@/lib/redux/authSlice";
import { calculateAllowedRoutes } from "@/lib/utils/routes";

/**
 * A hook that handles authentication verification on app load.
 * It checks if there are tokens in the store, and if so, it fetches
 * the user profile to verify authentication and get fresh user data.
 * It also handles fetching store information and calculating route permissions.
 */
export function useAuthCheck() {
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isInitialized,
    accessToken,
    view,
    storeInfo,
    accesses,
    routePermissions,
  } = useAppSelector((state) => state.auth);

  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Skip query if not authenticated or already initialized or already checking
  const shouldSkipProfile =
    !isAuthenticated || isInitialized || !accessToken || isChecking || !!view; // Skip if view already exists to prevent refetching

  // Use the API hook with skip option for profile
  const {
    data: profileData,
    error: profileError,
    isLoading: isProfileLoading,
  } = useGetUserProfileQuery(undefined, {
    skip: shouldSkipProfile,
  });

  // Determine if we need to fetch store info (only for CLIENT users with access)
  const shouldFetchStore =
    isAuthenticated &&
    view?.type === "CLIENT" &&
    accesses &&
    accesses.length > 0 &&
    !storeInfo &&
    !isChecking; // Prevent multiple fetches

  // Get store ID if available
  const storeId =
    shouldFetchStore && accesses ? String(accesses[0].store_id) : undefined;

  // Skip store query if no need to fetch
  const {
    data: storeData,
    error: storeError,
    isLoading: isStoreLoading,
  } = useGetStoreInfoQuery(storeId || "", {
    skip: !shouldFetchStore || !storeId,
  });

  // Start the auth check process
  useEffect(() => {
    // If we have tokens but not initialized yet and not already checking
    if (
      isAuthenticated &&
      !isInitialized &&
      !isChecking &&
      !isProfileLoading &&
      !view
    ) {
      setIsChecking(true);
      setError(null);
    }
  }, [isAuthenticated, isInitialized, isChecking, isProfileLoading, view]);

  // Handle profile data when received
  useEffect(() => {
    if (profileData && isChecking) {
      dispatch(
        setUserData({
          user: profileData.user,
          view: profileData.view,
          accesses: profileData.accesses,
        })
      );

      // We'll let the store info effect handle the rest
      if (
        profileData.view?.type !== "CLIENT" ||
        !profileData.accesses ||
        profileData.accesses.length === 0
      ) {
        setIsChecking(false);
        setError(null);

        // Calculate route permissions
        const routePerms = calculateAllowedRoutes(profileData.view, null);
        dispatch(setRoutePermissions(routePerms));
      }
    }

    // Handle profile errors
    if (profileError && isChecking) {
      setError(profileError as Error);

      if ((profileError as any)?.status === 401) {
        dispatch(logout());
      }

      setIsChecking(false);
    }
  }, [profileData, profileError, dispatch, isChecking]);

  // Handle store data when received
  useEffect(() => {
    if (storeData && view?.type === "CLIENT" && shouldFetchStore) {
      dispatch(setStoreInfo(storeData));

      // Calculate route permissions with store data
      const routePerms = calculateAllowedRoutes(view, storeData);
      dispatch(setRoutePermissions(routePerms));

      if (isChecking) {
        setIsChecking(false);
        setError(null);
      }
    }

    // Store error doesn't fail auth, just sets permissions without store
    if (storeError && view?.type === "CLIENT" && isChecking) {
      // Calculate route permissions without store data
      const routePerms = calculateAllowedRoutes(view, null);
      dispatch(setRoutePermissions(routePerms));

      setIsChecking(false);
      setError(null);
    }
  }, [storeData, storeError, dispatch, view, isChecking, shouldFetchStore]);

  // Calculate and update route permissions whenever view or storeInfo changes
  useEffect(() => {
    if (isInitialized && view && !routePermissions && !isChecking) {
      const routePerms = calculateAllowedRoutes(view, storeInfo);
      dispatch(setRoutePermissions(routePerms));
    }
  }, [view, storeInfo, routePermissions, dispatch, isInitialized, isChecking]);

  // If for some reason we never get a response, eventually mark as initialized
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isChecking) {
      timeoutId = setTimeout(() => {
        dispatch(markInitialized());

        // Also set route permissions if possible
        if (view) {
          const routePerms = calculateAllowedRoutes(view, storeInfo);
          dispatch(setRoutePermissions(routePerms));
        }

        setIsChecking(false);
        setError(new Error("Authentication check timed out"));
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isChecking, dispatch, view, storeInfo]);

  return {
    // We're checking auth if we're in the process of verifying tokens
    // or if we have tokens but haven't initialized user data yet
    // or if we're loading profile or store data
    isCheckingAuth:
      isChecking ||
      (isAuthenticated && !isInitialized) ||
      isProfileLoading ||
      isStoreLoading,

    // For protected routes, consider a user authenticated if they have valid tokens,
    // even if we're still fetching their profile data
    isAuthenticated: isAuthenticated,

    // Route permissions
    routePermissions,

    // Store info for client users
    storeInfo,

    // User data
    user: view,

    // Include error state for components that need to handle auth errors
    error,
  };
}
