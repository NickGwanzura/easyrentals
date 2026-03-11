import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

export function createClient() {
  return createClientComponentClient<Database>();
}

// Re-export for convenience
export const supabase = createClient();
