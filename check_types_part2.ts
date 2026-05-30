// check_types_part2.ts
import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = process.env.VITE_SUPABASE_URL || "";
  const apiKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = createClient(url, apiKey);

  console.log("Starting part 2 type checks with valid asset uuid...");

  const validAssetId = "7de12eee-3e7e-4bbd-9fed-fb983a42cc70";
  const dummyUserId = "00000000-0000-0000-0000-000000000000";
  const validId = "11111111-1111-1111-1111-111111111111";

  const testPayloads = [
    {
      description: "Testing direction type with a boolean 'true'",
      payload: {
        id: validId,
        user_id: dummyUserId,
        asset_id: validAssetId,
        direction: true,
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing direction value with text 'INVALID_DIRECTION'",
      payload: {
        id: validId,
        user_id: dummyUserId,
        asset_id: validAssetId,
        direction: "INVALID_DIRECTION",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing amount type with boolean 'true'",
      payload: {
        id: validId,
        user_id: dummyUserId,
        asset_id: validAssetId,
        direction: "CALL",
        amount: true,
        entry_price: 1.2345,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing entry_price type with boolean 'true'",
      payload: {
        id: validId,
        user_id: dummyUserId,
        asset_id: validAssetId,
        direction: "CALL",
        amount: 10,
        entry_price: true,
        expiry_seconds: 60
      }
    },
    {
      description: "Testing expiry_seconds type with boolean 'true'",
      payload: {
        id: validId,
        user_id: dummyUserId,
        asset_id: validAssetId,
        direction: "CALL",
        amount: 10,
        entry_price: 1.2345,
        expiry_seconds: true
      }
    }
  ];

  for (const item of testPayloads) {
    console.log(`\n--- ${item.description} ---`);
    try {
      const { error } = await supabase.from("trades").insert([item.payload as any]);
      if (error) {
        console.log(`Code: ${error.code}`);
        console.log(`Message: ${error.message}`);
        console.log(`Details: ${error.details}`);
        console.log(`Hint: ${error.hint}`);
      } else {
        console.log("Successfully inserted/validated without type errors!");
      }
    } catch (e: any) {
      console.log("Exception caught:", e.message || e);
    }
  }
}

run();
