import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, HAY_SUPABASE } from './config.js'

// Cliente de Supabase (o null si aún no está configurado; la app funciona igual local).
export const supabase = HAY_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
