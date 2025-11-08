import { supabaseAdmin } from "./supabase-admin";

/**
 * Diagnostic script untuk check struktur database existing
 * Run ini untuk understand skema yang sebenarnya
 */

export async function diagnoseDatabaseSchema() {
  try {
    console.log("🔍 Diagnosing database schema...\n");

    // Check profiles_follows table
    console.log("📋 Checking profiles_follows table structure:");
    const { data: profilesFollowsColumns, error: pfError } =
      await supabaseAdmin
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_schema", "public")
        .eq("table_name", "profiles_follows");

    if (pfError) {
      console.error("❌ Error querying profiles_follows columns:", pfError);
    } else {
      console.log("✅ profiles_follows columns:", profilesFollowsColumns);
    }

    // Check notification_follows table
    console.log("\n📋 Checking notification_follows table structure:");
    const { data: notificationFollowsColumns, error: nfError } =
      await supabaseAdmin
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_schema", "public")
        .eq("table_name", "notification_follows");

    if (nfError) {
      console.error(
        "❌ Error querying notification_follows columns:",
        nfError
      );
    } else {
      console.log(
        "✅ notification_follows columns:",
        notificationFollowsColumns
      );
    }

    // Try to query actual data to see what columns exist
    console.log("\n📊 Attempting to query existing data:");
    const { data: pfData, error: pfDataError } = await supabaseAdmin
      .from("profiles_follows")
      .select("*")
      .limit(1);

    if (pfDataError) {
      console.error("❌ Error querying profiles_follows data:", pfDataError);
    } else {
      console.log("✅ profiles_follows sample data:", pfData);
      if (pfData && pfData.length > 0) {
        console.log("   Available columns:", Object.keys(pfData[0]));
      }
    }

    const { data: nfData, error: nfDataError } = await supabaseAdmin
      .from("notification_follows")
      .select("*")
      .limit(1);

    if (nfDataError) {
      console.error(
        "❌ Error querying notification_follows data:",
        nfDataError
      );
    } else {
      console.log("✅ notification_follows sample data:", nfData);
      if (nfData && nfData.length > 0) {
        console.log("   Available columns:", Object.keys(nfData[0]));
      }
    }

    console.log("\n✅ Diagnostic complete!");
  } catch (error) {
    console.error("💥 Unexpected error during diagnosis:", error);
  }
}

// Export untuk bisa di-call dari API route jika perlu
export async function getDatabaseSchema() {
  try {
    // Execute raw SQL untuk get exact schema
    const { data, error } = await supabaseAdmin.rpc("get_table_schema", {
      table_name: "profiles_follows",
    });

    if (error) {
      console.error("Error getting schema:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Call this function in development to diagnose
if (process.env.NODE_ENV === "development") {
  // Uncomment to run on startup
  // diagnoseDatabaseSchema().catch(console.error);
}
