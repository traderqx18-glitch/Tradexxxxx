// check_schema.ts
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !apiKey) {
    console.error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in the environment.");
    return;
  }

  const supabase = createClient(url, apiKey);

  console.log("Checking Supabase connection and selecting 1 row from key tables...\n");

  // Test 1: Query profiles
  try {
    const { data, error } = await supabase.from("profiles").select("*").limit(1);
    console.log("PROFILES query result:");
    console.log("Error:", error);
    console.log("Data:", data, "\n");
  } catch (err) {
    console.error("Profiles error:", err);
  }

  // Test 2: Query wallets
  try {
    const { data, error } = await supabase.from("wallets").select("*").limit(1);
    console.log("WALLETS query result:");
    console.log("Error:", error);
    console.log("Data:", data, "\n");
  } catch (err) {
    console.error("Wallets error:", err);
  }

  // Test 3: Query trades
  try {
    const { data, error } = await supabase.from("trades").select("*").limit(1);
    console.log("TRADES query result:");
    console.log("Error:", error);
    console.log("Data:", data, "\n");
  } catch (err) {
    console.error("Trades error:", err);
  }

  // Test 4: Dynamic schema probing via columns request
  const checkColumns = {
    trades: ["id", "user_id", "asset_id", "direction", "amount", "entry_price", "expiry_seconds", "exit_price"],
    profiles: ["id", "full_name", "email", "country", "account_status", "demo_balance", "live_balance"],
    wallets: ["id", "user_id", "balance", "demo_balance", "live_balance"]
  };

  for (const [table, cols] of Object.entries(checkColumns)) {
    console.log(`Checking hypothetical columns on '${table}' table...`);
    for (const col of cols) {
      const { error } = await supabase.from(table).select(col).limit(1);
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("column") || error.message.includes("does not exist")) {
          console.log(`  ❌ Column '${col}' DOES NOT EXIST on table '${table}'. Error: ${error.message}`);
        } else {
          console.log(`  ❓ Column '${col}' error code ${error.code}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ Column '${col}' EXISTS/is valid on table '${table}'`);
      }
    }
    console.log("");
  }
}

run();
