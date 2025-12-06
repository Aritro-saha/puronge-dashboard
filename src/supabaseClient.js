import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kfigctloeoseuewbleqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaWdjdGxvZW9zZXVld2JsZXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTEwNzIsImV4cCI6MjA3NTkyNzA3Mn0.2BKUnk-1uYMtGzlaGsT2fSWQSLVpxBUSk9xv4rko1Dw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);