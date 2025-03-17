import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types for our API responses
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  status: string;
  date_joined: string;
  password_last_changed: string;
  url: string | null;
  last_active: string;
  terms_accepted: boolean;
  otp: string | null;
  user_group: string;
}

export interface ViewToggles {
  id: number;
  role_id: number;
  view_type: string;
  [key: string]: any; // For all the boolean properties
}

export interface View {
  type: string; // 'ADMIN' | 'CLIENT' etc.
  access: any | null;
  accesses: Array<{
    store_id: string | null;
    user_id: number;
    role_id: number;
  }>;
  viewToggles: ViewToggles;
}

export interface Access {
  store_id: string | null;
  user_id: number;
  role_id: number;
}

export interface Store {
  number_of_members: number;
  owner: {
    id: number;
    email: string;
  };
  store: {
    id: number;
    onboarding_procedure: {
      onboarding_status: string;
    };
  };
}

export interface LoginResponse {
  message: string;
  user: User;
  view: View;
  accesses: Access[];
  tokens: {
    accessToken: string;
    refreshToken: string;
    clientToken: string;
  };
}

// User profile response interface
export interface UserProfileResponse {
  user: User;
  view: View;
  accesses: Access[];
}

// Base API service
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://stgapp-bwgkn3md.opensend.com",
    prepareHeaders: (headers, { getState }) => {
      // Get tokens from state
      const { accessToken, clientToken } = (getState() as any).auth;

      // If we have tokens, add them to the headers
      if (accessToken) {
        headers.set("Access-Token", `Bearer ${accessToken}`);
      }
      if (clientToken) {
        headers.set("Client-Token", clientToken);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (credentials) => ({
          url: "/auth/login",
          method: "POST",
          body: credentials,
        }),
      }
    ),

    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => "/self/profile",
    }),

    getStoreInfo: builder.query<Store, string>({
      query: (storeId) => `/store/${storeId}`,
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useGetUserProfileQuery,
  useGetStoreInfoQuery,
} = api;
