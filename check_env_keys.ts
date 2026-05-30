// check_env_keys.ts
console.log("Environment keys:");
console.log(JSON.stringify(Object.keys(process.env).filter(k => k.toLowerCase().includes("supabase")), null, 2));
