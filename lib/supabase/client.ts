// Supabase removed — all auth is demo/localStorage based.
// This stub prevents import errors across the codebase.

const noopQuery: any = {
  select: () => noopQuery,
  insert: () => noopQuery,
  update: () => noopQuery,
  upsert: () => noopQuery,
  delete: () => noopQuery,
  eq: () => noopQuery,
  neq: () => noopQuery,
  in: () => noopQuery,
  is: () => noopQuery,
  order: () => noopQuery,
  limit: () => noopQuery,
  single: () => Promise.resolve({ data: null, error: null }),
  maybeSingle: () => Promise.resolve({ data: null, error: null }),
  then: (resolve: (v: any) => any) => Promise.resolve({ data: null, error: null }).then(resolve),
};

const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Use demo credentials') }),
  signUp: () => Promise.resolve({ data: null, error: new Error('Sign up not available in demo') }),
  signOut: () => Promise.resolve({ error: null }),
  resetPasswordForEmail: () => Promise.resolve({ error: null }),
  updateUser: () => Promise.resolve({ data: null, error: null }),
  onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

export const supabase: any = {
  auth: noopAuth,
  from: (_table: string) => noopQuery,
};

export function createClient() {
  return supabase;
}
