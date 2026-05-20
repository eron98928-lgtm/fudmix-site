import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fgridsakklpswtvkoqld.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmlkc2Fra2xwc3d0dmtvcWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjgyODEsImV4cCI6MjA5NDYwNDI4MX0.ugmk2VRDDG7wjHGk42veHMjaRMNVyOCAnfFkeZfB_o0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
