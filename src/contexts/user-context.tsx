"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  supabaseUser: SupabaseUser | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getUser = async () => {
      try {
        console.log("UserContext: Fetching user...");
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        console.log("UserContext: Auth user:", authUser);
        console.log("UserContext: Auth error:", authError);

        if (authUser) {
          setSupabaseUser(authUser);

          console.log("UserContext: Querying users table for ID:", authUser.id);

          // Fetch user profile from our custom table
          const queryPromise = supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          console.log("UserContext: Query initiated, waiting for response...");

          // Add 5 second timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout after 5s")), 5000)
          );

          try {
            const result = (await Promise.race([queryPromise, timeoutPromise])) as { data: User | null; error: unknown };
            const { data: profile, error } = result;

            console.log("UserContext: Query completed!");
            console.log("UserContext: Profile query result - Data:", profile);
            console.log("UserContext: Profile query result - Error:", error);

            if (profile) {
              console.log("UserContext: Setting user profile:", profile);
              setUser(profile);
            } else if (error) {
              console.error("UserContext: FAILED to fetch profile. Error details:", {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
              });
            } else {
              console.error("UserContext: Profile is null but no error returned");
            }
          } catch (timeoutError) {
            console.error("UserContext: QUERY TIMEOUT OR ERROR:", timeoutError);
            // Try direct fetch as fallback
            console.log("UserContext: Attempting fallback query...");
            try {
              const { data: profile, error } = await queryPromise;
              console.log("UserContext: Fallback query - Data:", profile);
              console.log("UserContext: Fallback query - Error:", error);

              if (profile) {
                console.log("UserContext: Fallback - Setting user profile:", profile);
                setUser(profile);
              }
            } catch (fallbackError) {
              console.error("UserContext: Fallback query also failed:", fallbackError);
            }
          }
        } else {
          console.log("UserContext: No auth user found");
        }
      } catch (err) {
        console.error("UserContext: Exception in getUser:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("UserContext: Auth state changed -", event, session?.user?.email);

        if (session?.user) {
          setSupabaseUser(session.user);

          console.log("UserContext: Auth change - Querying users table for ID:", session.user.id);

          // Fetch user profile with timeout
          const queryPromise = supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          console.log("UserContext: Auth change - Query initiated, waiting for response...");

          // Add 5 second timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout after 5s")), 5000)
          );

          try {
            const result = (await Promise.race([queryPromise, timeoutPromise])) as { data: User | null; error: unknown };
            const { data: profile, error } = result;

            console.log("UserContext: Auth change - Query completed!");
            console.log("UserContext: Auth change - Profile query result - Data:", profile);
            console.log("UserContext: Auth change - Profile query result - Error:", error);

            if (profile) {
              console.log("UserContext: Auth change - Setting user profile:", profile);
              setUser(profile);
            } else if (error) {
              console.error("UserContext: Auth change - FAILED to fetch profile. Error details:", {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
              });
            } else {
              console.error("UserContext: Auth change - Profile is null but no error returned");
            }
          } catch (timeoutError) {
            console.error("UserContext: Auth change - QUERY TIMEOUT OR ERROR:", timeoutError);
            // Try direct fetch as fallback
            console.log("UserContext: Attempting fallback query...");
            try {
              const { data: profile, error } = await queryPromise;
              console.log("UserContext: Fallback query - Data:", profile);
              console.log("UserContext: Fallback query - Error:", error);

              if (profile) {
                console.log("UserContext: Fallback - Setting user profile:", profile);
                setUser(profile);
              }
            } catch (fallbackError) {
              console.error("UserContext: Fallback query also failed:", fallbackError);
            }
          }
        } else {
          console.log("UserContext: Auth change - No session user, clearing state");
          setUser(null);
          setSupabaseUser(null);
        }
      } catch (err) {
        console.error("UserContext: Exception in auth state change:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <UserContext.Provider value={{ user, isLoading, supabaseUser }}>
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
