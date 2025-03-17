import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, View, Access, Store } from "./api";
import { STORAGE_KEYS } from "@/lib/constants";
import type { RoutePermissions } from "@/lib/utils/routes";

interface AuthState {
  user: User | null;
  view: View | null;
  accesses: Access[] | null;
  accessToken: string | null;
  clientToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  storeInfo: Store | null;
  error: string | null;
  routePermissions: RoutePermissions | null;
}

const initialState: AuthState = {
  user: null,
  view: null,
  accesses: null,
  accessToken: null,
  clientToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
  storeInfo: null,
  error: null,
  routePermissions: null,
};

// Initialize state from localStorage - only load tokens, not user data
const loadAuthState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const clientToken = localStorage.getItem(STORAGE_KEYS.CLIENT_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      return {
        ...initialState,
        accessToken,
        clientToken,
        refreshToken,
        // We'll mark as authenticated if we have tokens, but user data will be fetched
        isAuthenticated: true,
        isInitialized: false,
      };
    }
  } catch (error) {
    // Do nothing
  }

  return {
    ...initialState,
    isInitialized: true,
  };
};

export const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),
  reducers: {
    // Set just the credentials after login
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        view: View;
        accesses: Access[];
        accessToken: string;
        refreshToken: string;
        clientToken: string;
      }>
    ) => {
      const { user, view, accesses, accessToken, refreshToken, clientToken } =
        action.payload;

      // Update all state
      state.user = user;
      state.view = view;
      state.accesses = accesses;
      state.accessToken = accessToken;
      state.clientToken = clientToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.error = null;

      // Store only tokens in localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.CLIENT_TOKEN, clientToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      } catch (error) {
        state.error = "Failed to store authentication tokens";
      }
    },

    // Update user data without changing tokens (for refreshing user data)
    setUserData: (
      state,
      action: PayloadAction<{
        user: User;
        view: View;
        accesses: Access[];
      }>
    ) => {
      const { user, view, accesses } = action.payload;
      state.user = user;
      state.view = view;
      state.accesses = accesses;
      state.isInitialized = true;
      state.error = null;
    },

    // Update tokens without changing user data (for token refresh)
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        clientToken?: string;
      }>
    ) => {
      const { accessToken, refreshToken, clientToken } = action.payload;
      state.accessToken = accessToken;
      state.error = null;

      try {
        if (refreshToken) {
          state.refreshToken = refreshToken;
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        if (clientToken) {
          state.clientToken = clientToken;
          localStorage.setItem(STORAGE_KEYS.CLIENT_TOKEN, clientToken);
        }

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      } catch (error) {
        state.error = "Failed to update authentication tokens";
      }
    },

    // Clear auth state on logout
    logout: (state) => {
      // Reset all state
      Object.assign(state, {
        ...initialState,
        isInitialized: true,
      });

      // Clear localStorage tokens
      try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CLIENT_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      } catch (error) {
        state.error = "Failed to clear authentication tokens";
      }
    },

    // Mark auth state as initialized (used after initial data fetch)
    markInitialized: (state) => {
      state.isInitialized = true;
      state.error = null;
    },

    // Add store info
    setStoreInfo: (state, action: PayloadAction<Store>) => {
      state.storeInfo = action.payload;
      state.error = null;
    },

    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Set route permissions
    setRoutePermissions: (state, action: PayloadAction<RoutePermissions>) => {
      state.routePermissions = action.payload;
    },
  },
});

export const {
  setCredentials,
  setUserData,
  updateTokens,
  logout,
  markInitialized,
  setStoreInfo,
  setError,
  setRoutePermissions,
} = authSlice.actions;

export default authSlice.reducer;
