
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gvlfmywrerbxbzixvpot.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGZteXdyZXJieGJ6aXh2cG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTc0MzMsImV4cCI6MjA2MjE5MzQzM30.YcC8gOvZKD82ZtfPq9he6NjCkiirpk9tBAiztEAFN-c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
