// check_types.ts
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = createClient(url, apiKey);

  console.log("Triggering type reflection errors from PostgreSQL...\n");

  const testPayloads = [
    {
      description: "Testing 'id' type (sending non-uuid string 'not-a-uuid')",
      payload: {
        id: "not-a-uuid",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: "EUR/USD",
        direction: "CALL",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'user_id' type (sending boolean true)",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: true,
        asset_id: "EUR/USD",
        direction: "CALL",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'asset_id' type (sending boolean true)",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: true,
        direction: "CALL",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'direction' type (sending boolean true)",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: "EUR/USD",
        direction: true,
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'amount' type (sending non-numeric string 'not-a-number')",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: "EUR/USD",
        direction: "CALL",
        amount: "not-a-number",
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'entry_price' type (sending non-numeric string 'not-a-number')",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: "EUR/USD",
        direction: "CALL",
        amount: 10,
        entry_price: "not-a-number",
        expiry_seconds: 60
      }
    },
    {
      description: "Testing 'expiry_seconds' type (sending non-numeric string 'not-a-number')",
      payload: {
        id: "11111111-1111-1111-1111-111111111111",
        user_id: "00000000-0000-0000-0000-000000000000",
        asset_id: "EUR/USD",
        direction: "CALL",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: "not-a-number"
      }
    }
  ];

  for (const item of testPayloads) {
    console.log(`--- ${item.description} ---`);
    try {
      const { error } = await supabase.from("trades").insert([item.payload as any]);
      if (error) {
        console.log(`Code: ${error.code}`);
        console.log(`Message: ${error.message}`);
        console.log(`Details: ${error.details}`);
        console.log(`Hint: ${error.hint}\n`);
      } else {
        console.log("Successfully inserted (no type error?)\n");
      }
    } catch (e: any) {
      console.log("Exception caught:", e.message || e, "\n");
    }
  }
}

run();
