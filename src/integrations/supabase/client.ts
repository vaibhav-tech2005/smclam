// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hctpznmywiysmemqidja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdHB6bm15d2l5c21lbXFpZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTU3MTEsImV4cCI6MjA2MDA5MTcxMX0.CB8RBgRcbJwc1ghNvJNC0zeh2LQ7C8ndVINyvgVGFDY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);