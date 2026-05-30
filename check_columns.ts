// check_columns.ts
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = createClient(url, apiKey);

  console.log("Checking if we can access information_schema via RPC or direct select...");
  const { data, error } = await supabase.from("information_schema.columns" as any).select("table_name, column_name, data_type").eq("table_schema", "public");
  if (error) {
    console.log("Could not access information_schema directly:", error.message);
  } else {
    console.log("Columns metadata from information_schema:");
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Let's test specific column names on 'profiles' table to find out what exists
  const potentialProfileColumns = [
    "username", "avatar_url", "updated_at", "created_at", "trader_name", "phone", "status", "role"
  ];
  console.log("\nProbing other potential columns on profiles...");
  for (const col of potentialProfileColumns) {
    const { error: colErr } = await supabase.from("profiles").select(col).limit(1);
    if (!colErr) {
      console.log(`  ✅ Profile column exists: ${col}`);
    } else if (!colErr.message.includes("column")) {
      console.log(`  ❓ Profile column error for ${col}: ${colErr.message}`);
    }
  }

  // Let's test specific column names on 'wallets' table to find out what exists
  const potentialWalletColumns = [
    "usd_balance", "btc_balance", "eth_balance", "balance_demo", "balance_live", "demo", "live", "wallet_type", "amount", "currency", "created_at"
  ];
  console.log("\nProbing other potential columns on wallets...");
  for (const col of potentialWalletColumns) {
    const { error: colErr } = await supabase.from("wallets").select(col).limit(1);
    if (!colErr) {
      console.log(`  ✅ Wallet column exists: ${col}`);
    } else if (!colErr.message.includes("column")) {
      console.log(`  ❓ Wallet column error for ${col}: ${colErr.message}`);
    }
  }
}

run();
