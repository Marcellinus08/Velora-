import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * API endpoint untuk debug database schema
 * GET /api/debug/database-schema
 * 
 * Returns:
 * - Current table structures
 * - Available columns
 * - Indexes
 * - Triggers
 * - Sample data
 */

export async function GET(request: NextRequest) {
  try {
    // Security check - only in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get("table") || "all";

    const result: any = {
      timestamp: new Date().toISOString(),
      tables: {},
    };

    // Helper function untuk get table info
    const getTableInfo = async (tableName: string) => {
      try {
        // Get columns
        const { data: columns, error: colError } = await supabaseAdmin
          .from("information_schema.columns")
          .select("column_name, data_type, is_nullable, column_default")
          .eq("table_schema", "public")
          .eq("table_name", tableName)
          .order("ordinal_position");

        if (colError) throw colError;

        // Get sample data
        const { data: sampleData, error: dataError } = await supabaseAdmin
          .from(tableName)
          .select("*")
          .limit(1);

        if (dataError && dataError.code !== "PGRST116") throw dataError;

        // Get row count
        const { count, error: countError } = await supabaseAdmin
          .from(tableName)
          .select("*", { count: "exact", head: true });

        return {
          name: tableName,
          columns: columns || [],
          sampleData: sampleData || [],
          rowCount: count || 0,
          availableFields:
            sampleData && sampleData.length > 0
              ? Object.keys(sampleData[0])
              : [],
        };
      } catch (error: any) {
        return {
          name: tableName,
          error: error.message || String(error),
        };
      }
    };

    // Get info untuk tables yang di-request
    if (table === "all") {
      result.tables.profiles_follows = await getTableInfo("profiles_follows");
      result.tables.notification_follows = await getTableInfo(
        "notification_follows"
      );
    } else {
      result.tables[table] = await getTableInfo(table);
    }

    // Check missing columns
    result.validation = {
      profiles_follows: {
        expectedColumns: [
          "id",
          "follower_addr",
          "followee_addr",
          "created_at",
          "updated_at",
        ],
        actualColumns:
          result.tables.profiles_follows.availableFields || [],
        missingColumns: [],
      },
      notification_follows: {
        expectedColumns: [
          "id",
          "follower_addr",
          "followee_addr",
          "message",
          "is_read",
          "created_at",
          "read_at",
        ],
        actualColumns:
          result.tables.notification_follows.availableFields || [],
        missingColumns: [],
      },
    };

    // Calculate missing columns
    result.validation.profiles_follows.missingColumns =
      result.validation.profiles_follows.expectedColumns.filter(
        (col: string) =>
          !result.validation.profiles_follows.actualColumns.includes(col)
      );

    result.validation.notification_follows.missingColumns =
      result.validation.notification_follows.expectedColumns.filter(
        (col: string) =>
          !result.validation.notification_follows.actualColumns.includes(col)
      );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Database diagnostic error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve database schema",
        message: error.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
