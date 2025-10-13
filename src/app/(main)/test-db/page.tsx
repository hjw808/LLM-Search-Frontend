"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface TestResults {
  authUser: unknown;
  profileData?: unknown;
}

interface TestErrors {
  authError?: unknown;
  queryError?: unknown;
}

export default function TestDBPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<TestErrors | null>(null);

  useEffect(() => {
    const test = async () => {
      const supabase = createClient();

      // Test 1: Check auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log("Auth user:", authUser);
      console.log("Auth error:", authError);

      if (authUser) {
        // Test 2: Try to query users table
        const { data, error: queryError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        console.log("Query data:", data);
        console.log("Query error:", queryError);

        setResults({ authUser, profileData: data });
        setError({ authError, queryError });
      } else {
        setResults({ authUser: null });
        setError({ authError });
      }
    };

    test();
  }, []);

  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Database Connection Test</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Auth User:</h2>
            <pre className="text-sm text-slate-300 bg-black/30 p-4 rounded overflow-auto">
              {JSON.stringify(results?.authUser, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Profile Data:</h2>
            <pre className="text-sm text-slate-300 bg-black/30 p-4 rounded overflow-auto">
              {JSON.stringify(results?.profileData, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Errors:</h2>
            <pre className="text-sm text-red-400 bg-black/30 p-4 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Environment Check:</h2>
            <pre className="text-sm text-slate-300 bg-black/30 p-4 rounded overflow-auto">
              {JSON.stringify({
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
