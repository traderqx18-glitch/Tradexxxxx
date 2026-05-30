// fetch_postgrest_openapi.ts
async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !apiKey) {
    console.error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not defined.");
    return;
  }

  // Ensure url ends with /rest/v1 / if not already included or append
  let restUrl = url;
  if (!restUrl.includes("/rest/v1")) {
    restUrl = restUrl.replace(/\/$/, "") + "/rest/v1/";
  }

  try {
    const response = await fetch(restUrl, {
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`
      }
    });
    console.log("PostgREST Schema JSON status:", response.status);
    if (!response.ok) {
      console.error("Fetch failed", await response.text());
      return;
    }
    const data = await response.json();
    const definitions = data.definitions || {};

    console.log("\n--- EXPOSED TABLES AND VIEWS ---");
    for (const tableName of Object.keys(definitions)) {
      console.log(`Table: ${tableName}`);
      const properties = definitions[tableName].properties || {};
      for (const [colName, val] of Object.entries(properties)) {
        const typeInfo = (val as any).type || (val as any).format || "unknown";
        console.log(`  - ${colName}: ${typeInfo}`);
      }
    }
  } catch (err: any) {
    console.error("Error retrieving PostgREST schema:", err.message || err);
  }
}

run();
