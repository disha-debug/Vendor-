/**
 * Environment validation. Fail fast at runtime if required vars are missing.
 * Use only VITE_* (public) vars in frontend. Never expose SUPABASE_SERVICE_ROLE_KEY.
 */

const required = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
} as const;

function getEnv(): {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
} {
  const missing = (Object.entries(required) as [keyof typeof required, string][]).filter(
    ([, v]) => v === undefined || v === ""
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required env: ${missing.map(([k]) => k).join(", ")}. Check .env and .env.example.`
    );
  }
  return required as { VITE_SUPABASE_URL: string; VITE_SUPABASE_PUBLISHABLE_KEY: string };
}

export const env = getEnv();
