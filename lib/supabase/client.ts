import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  return createClientComponentClient();
}

// Re-export for convenience
export const supabase = createClient();
