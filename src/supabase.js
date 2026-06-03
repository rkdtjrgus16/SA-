import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xelizczeteumetpaadgf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbGl6Y3pldGV1bWV0cGFhZGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDc1NTQsImV4cCI6MjA5NTg4MzU1NH0.HrREWN-F5USqs5-O8d1LpatLntPdAL2lHh8dL4lX138';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isSupabaseConfigured = true;
