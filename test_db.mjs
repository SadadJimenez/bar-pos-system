import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oakaxxozbkkrdzrevixs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ha2F4eG96YmtrcmR6cmV2aXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjIzNjIsImV4cCI6MjA4NzczODM2Mn0.2sg1ap72zFJ_v_-KiHBFjt-O9UOvE0ThVE2G-iZYRwM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    const { data, error } = await supabase.from('users').select('*');
    console.log('users:', data, error);
}

test();
