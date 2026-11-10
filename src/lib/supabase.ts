import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const chave =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabaseConfigurado = Boolean(url && chave && !url.includes('seu-projeto'));

let cliente: SupabaseClient | null = null;

/** Cliente único (navegador ou servidor). Devolve null se as variáveis de ambiente não existem. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigurado) return null;
  if (!cliente) cliente = createClient(url, chave);
  return cliente;
}
