// check_assets.ts
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = createClient(url, apiKey);

  console.log("Checking if 'assets' table exists and querying its contents...");
  try {
    const { data: assetsData, error: assetsErr } = await supabase.from("assets").select("*").limit(20);
    if (assetsErr) {
      console.log("Error querying assets table:", assetsErr.message);
    } else {
      console.log("Assets table rows:");
      console.log(JSON.stringify(assetsData, null, 2));
    }
  } catch (err: any) {
    console.log("Exception querying assets table:", err.message || err);
  }
}

run();
