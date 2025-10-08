"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  jobTitle: string;
}

interface UserContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load user from Supabase on mount and listen to auth changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get current auth user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setSupabaseUser(authUser);

        if (authUser) {
          // Fetch user profile from database
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              email: profile.email,
              companyName: profile.company_name || "",
              companyWebsite: profile.company_website || "",
              jobTitle: profile.job_title || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        // Reload user profile when auth state changes
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email,
            companyName: profile.company_name || "",
            companyWebsite: profile.company_website || "",
            jobTitle: profile.job_title || "",
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const updateUser = async (userData: Partial<User>) => {
    if (!supabaseUser) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          company_name: userData.companyName,
          company_website: userData.companyWebsite,
          job_title: userData.jobTitle,
        })
        .eq("id", supabaseUser.id);

      if (error) throw error;

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...userData } : null));
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!supabaseUser) return;

    try {
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (profile) {
        setUser({
          id: profile.id,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email,
          companyName: profile.company_name || "",
          companyWebsite: profile.company_website || "",
          jobTitle: profile.job_title || "",
        });
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const clearUser = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <UserContext.Provider value={{ user, supabaseUser, updateUser, clearUser, refreshUser, isLoading }}>
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
