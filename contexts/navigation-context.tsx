"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { NavItem } from "@/components/navigation";

type NavigationContextType = "main" | "student" | "staff";

export interface ContextData {
  avatar?: string;
  subtitle?: string;
  status?: string;
  [key: string]: any;
}

interface NavigationContextValue {
  contextType: NavigationContextType;
  contextId?: string;
  contextNavItems?: NavItem[];
  contextTitle?: string;
  contextData?: ContextData;
  /** True when the logged-in user IS a student/staff viewing their own portal */
  isPortalUser: boolean;
  setMainNavigation: () => void;
  setStudentNavigation: (studentId: string, studentName?: string, data?: ContextData) => void;
  setStaffNavigation: (staffId: string, staffName?: string, data?: ContextData) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const [contextType, setContextType] =
    useState<NavigationContextType>("main");
  const [contextId, setContextId] = useState<string>();
  const [contextNavItems, setContextNavItems] = useState<NavItem[]>();
  const [contextTitle, setContextTitle] = useState<string>();
  const [contextData, setContextData] = useState<ContextData>();

  // Portal user = the logged-in user is a student or staff viewing their own portal
  const isPortalUser =
    user?.account_type === "student" //|| user?.account_type === "staff";

  const setMainNavigation = useCallback(() => {
    setContextType("main");
    setContextId(undefined);
    setContextNavItems(undefined);
    setContextTitle(undefined);
    setContextData(undefined);
  }, []);

  const setStudentNavigation = useCallback(
    (studentId: string, studentName?: string, data?: ContextData) => {
      setContextType("student");
      setContextId(studentId);
      setContextTitle(studentName || "Student");
      setContextData(data);
      // Navigation items will be generated in the sidebar
      setContextNavItems(undefined);
    },
    []
  );

  const setStaffNavigation = useCallback(
    (staffId: string, staffName?: string, data?: ContextData) => {
      setContextType("staff");
      setContextId(staffId);
      setContextTitle(staffName || "Staff Member");
      setContextData(data);
      // Navigation items will be generated in the sidebar
      setContextNavItems(undefined);
    },
    []
  );

  return (
    <NavigationContext.Provider
      value={{
        contextType,
        contextId,
        contextNavItems,
        contextTitle,
        contextData,
        isPortalUser,
        setMainNavigation,
        setStudentNavigation,
        setStaffNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
