
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdeumhpgjlnrhskndxxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZXVtaHBnamxucmhza25keHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDk4ODcsImV4cCI6MjA4ODEyNTg4N30.mev2pzrB8M2m4Y-uvV_bMjMpOL_tGPVjZoyFhM0Yfq0';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase }
        