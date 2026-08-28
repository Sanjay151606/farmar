const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vwgmxetvvufcrasysqlm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('⚡ Supabase Cloud Database Client Initialized:', SUPABASE_URL);
  } catch (err) {
    console.warn('⚠️ Supabase Client init failed, using local fallback:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not fully set, using local storage engine.');
}

module.exports = {
  supabase,
  isSupabaseEnabled: () => !!supabase
};
