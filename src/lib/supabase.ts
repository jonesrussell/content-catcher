import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseUrl = "https://qgkgexgtfslszvosltrf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFna2dleGd0ZnNsc3p2b3NsdHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMzg4MTgsImV4cCI6MjA1NzgxNDgxOH0.UMbeObxujW3EI7UWHXbDOcfJuMJ21t2vRKqlcd3GwAA";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
