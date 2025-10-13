import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MONTHLY_TEST_LIMIT = 1;

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get current month-year string (format: "YYYY-MM")
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check test usage for current month
    const { data: usage, error: usageError } = await supabase
      .from("test_usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .single();

    if (usageError && usageError.code !== "PGRST116") { // PGRST116 is "not found" error
      console.error("Error fetching usage:", usageError);
      return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
    }

    const testCount = usage?.test_count || 0;
    const hasTestsRemaining = testCount < MONTHLY_TEST_LIMIT;

    return NextResponse.json({
      testCount,
      limit: MONTHLY_TEST_LIMIT,
      hasTestsRemaining,
      monthYear,
    });
  } catch (err) {
    console.error("Exception in usage check:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// Increment test usage
export async function POST() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get current month-year string
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check current usage first
    const { data: usage } = await supabase
      .from("test_usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .single();

    const currentCount = usage?.test_count || 0;

    // Check if limit reached
    if (currentCount >= MONTHLY_TEST_LIMIT) {
      return NextResponse.json(
        { error: "Monthly test limit reached", limit: MONTHLY_TEST_LIMIT },
        { status: 429 }
      );
    }

    // Increment or create usage record
    if (usage) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("test_usage")
        .update({ test_count: currentCount + 1 })
        .eq("user_id", user.id)
        .eq("month_year", monthYear);

      if (updateError) {
        console.error("Error updating usage:", updateError);
        return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("test_usage")
        .insert({
          user_id: user.id,
          test_count: 1,
          month_year: monthYear,
        });

      if (insertError) {
        console.error("Error creating usage:", insertError);
        return NextResponse.json({ error: "Failed to create usage record" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      testCount: currentCount + 1,
      limit: MONTHLY_TEST_LIMIT,
    });
  } catch (err) {
    console.error("Exception in usage increment:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
