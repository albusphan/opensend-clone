import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Define the structure of your API error data
export interface ApiErrorData {
  code?: string;
  message?: string;
  status?: number;
  [key: string]: unknown; // For any additional properties
}

// Create a union type for RTK Query errors
export type ApiError =
  | (FetchBaseQueryError & {
      data?: ApiErrorData;
    })
  | SerializedError;

// Auth-specific error codes
export enum AuthErrorCode {
  EMAIL_NOT_FOUND = "AUTH_EMAIL_NOTFOUND",
  INVALID_PASSWORD = "AUTH_INVALID_PASSWORD",
}
