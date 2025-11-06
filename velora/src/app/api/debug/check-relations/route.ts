import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * API endpoint untuk check foreign key relationships
 * GET /api/debug/check-relations
 */

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 }
      );
    }

    const result: any = {
      timestamp: new Date().toISOString(),
      foreignKeys: {},
      analysis: {
        profiles_follows: {
          hasForeignKey: false,
          issues: [],
          recommendation: ""
        },
        notification_follows: {
          hasForeignKey: false,
          issues: [],
          recommendation: ""
        }
      }
    };

    // Query information_schema untuk foreign keys
    const { data: foreignKeys, error: fkError } = await supabaseAdmin
      .from("information_schema.table_constraints")
      .select("constraint_name, constraint_type, table_name")
      .in("constraint_type", ["FOREIGN KEY"]);

    if (!fkError && foreignKeys) {
      result.foreignKeys.allConstraints = foreignKeys;
      
      // Filter untuk profiles_follows
      const pf_fk = foreignKeys.filter((fk: any) => 
        fk.table_name === "profiles_follows"
      );
      
      // Filter untuk notification_follows
      const nf_fk = foreignKeys.filter((fk: any) => 
        fk.table_name === "notification_follows"
      );

      result.analysis.profiles_follows.hasForeignKey = pf_fk.length > 0;
      result.analysis.notification_follows.hasForeignKey = nf_fk.length > 0;
    }

    // Get detailed constraint info dari pg_constraint
    try {
      const { data: constraints } = await supabaseAdmin
        .rpc("get_constraint_info") as any;
      
      if (constraints) {
        result.detailedConstraints = constraints;
      }
    } catch {
      // RPC might not exist, continue with analysis
    }

    // Analysis dan recommendation
    if (!result.analysis.profiles_follows.hasForeignKey) {
      result.analysis.profiles_follows.issues.push(
        "profiles_follows table tidak memiliki FOREIGN KEY ke profiles table"
      );
      result.analysis.profiles_follows.recommendation = 
        "RECOMMENDED: Tambahkan foreign key untuk data integrity. Saat ini menggunakan text address (tidak dijamin valid).";
    } else {
      result.analysis.profiles_follows.recommendation = 
        "✓ Foreign key sudah ada";
    }

    if (!result.analysis.notification_follows.hasForeignKey) {
      result.analysis.notification_follows.issues.push(
        "notification_follows table tidak memiliki FOREIGN KEY ke profiles_follows"
      );
      result.analysis.notification_follows.recommendation = 
        "RECOMMENDED: Tambahkan foreign key untuk cascading delete.";
    } else {
      result.analysis.notification_follows.recommendation = 
        "✓ Foreign key sudah ada";
    }

    // Manual check dengan sample query
    result.sampleProfiles = [];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, abstract_id, username")
      .limit(3);
    
    if (profiles) {
      result.sampleProfiles = profiles;
    }

    result.sampleFollows = [];
    const { data: follows } = await supabaseAdmin
      .from("profiles_follows")
      .select("id, follower_addr, followee_addr, created_at")
      .limit(3);
    
    if (follows) {
      result.sampleFollows = follows;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Check relations error:", error);
    return NextResponse.json(
      {
        error: "Failed to check relations",
        message: error.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
