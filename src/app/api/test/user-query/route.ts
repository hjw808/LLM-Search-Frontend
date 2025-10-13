import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Server API: Starting user query test...");

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    console.log("Server API: Auth user:", authUser?.id);
    console.log("Server API: Auth error:", authError);

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated", authError });
    }

    // Try querying the users table with timeout
    console.log("Server API: Querying users table for ID:", authUser.id);

    const queryPromise = supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout after 5s")), 5000)
    );

    try {
      const result = await Promise.race([queryPromise, timeoutPromise]) as { data: unknown; error: unknown };
      const { data: profile, error } = result;

      console.log("Server API: Query completed - Data:", profile);
      console.log("Server API: Query completed - Error:", error);

      return NextResponse.json({
        success: true,
        authUser: { id: authUser.id, email: authUser.email },
        profile,
        error,
      });
    } catch (timeoutError) {
      console.error("Server API: Query timeout!");

      // Try to get the actual query result
      try {
        const { data: profile, error } = await queryPromise;
        return NextResponse.json({
          success: false,
          message: "Query timed out but completed after",
          profile,
          error,
        });
      } catch (fallbackError) {
        return NextResponse.json({
          success: false,
          message: "Query timed out and fallback failed",
          timeoutError: timeoutError instanceof Error ? timeoutError.message : String(timeoutError),
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
      }
    }
  } catch (err) {
    console.error("Server API: Exception:", err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
