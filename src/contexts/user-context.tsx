"use client";

import { createContext, useContext, ReactNode } from "react";

// Simple user interface - no authentication needed
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserContextType {
  user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Default user - no login required
const DEFAULT_USER: User = {
  id: "user-1",
  firstName: "User",
  lastName: "",
  email: "user@example.com",
};

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user: DEFAULT_USER }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
