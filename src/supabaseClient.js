import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kohrpthnaehxocufxqad.supabase.co';

// Acceder a la clave de la variable de entorno con el prefijo correcto
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error("supabaseKey is required.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
