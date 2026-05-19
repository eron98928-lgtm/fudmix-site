import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fgridsakklpswtvkoqld.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c54Wl9MKPtvAnHzPaK4FBg_XVBUcBuLBMDUANDqb3Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
