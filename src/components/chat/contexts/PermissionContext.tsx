import { createContext, useContext } from 'react';
import type { PendingPermissionRequest } from '../types/types';

export interface PermissionDecision {
  allow?: boolean;
  message?: string;
  rememberEntry?: string | null;
  updatedInput?: unknown;
}

interface PermissionContextValue {
  pendingPermissionRequests: PendingPermissionRequest[];
  handlePermissionDecision: (
    requestIds: string | string[],
    decision: PermissionDecision,
  ) => void;
}

export const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermission(): PermissionContextValue | null {
  return useContext(PermissionContext);
}
