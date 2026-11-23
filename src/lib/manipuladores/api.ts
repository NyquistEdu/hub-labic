import { createHash, timingSafeEqual } from 'node:crypto';
import type { Linha, Robo } from './robos';
import { acharRobo } from './robos';

export function resposta(dados: unknown, status = 200): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const erro = (mensagem: string, status = 400) => resposta({ erro: mensagem }, status);

export async function lerCorpo(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const t = await req.text();
    if (t.length > 20000) return null;
    const j = JSON.parse(t);
    return j && typeof j === 'object' && !Array.isArray(j) ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Lista de n números finitos e razoáveis, ou null. */
export function numeros(v: unknown, n: number, limite = 10000): number[] | null {
  if (!Array.isArray(v) || v.length !== n) return null;
  const out: number[] = [];
  for (const x of v) {
    if (typeof x !== 'number' || !Number.isFinite(x) || Math.abs(x) > limite) return null;
    out.push(x);
  }
  return out;
}

export function tabela(v: unknown, n: number): Linha[] | null {
  if (!Array.isArray(v) || v.length !== n) return null;
  const out: Linha[] = [];
  for (const r of v) {
    if (!r || typeof r !== 'object') return null;
    const l = numeros([(r as Record<string, unknown>).a, (r as Record<string, unknown>).al, (r as Record<string, unknown>).d, (r as Record<string, unknown>).th], 4);
    if (!l) return null;
    out.push({ a: l[0], al: l[1], d: l[2], th: l[3] });
  }
  return out;
}

export function roboDoCorpo(corpo: Record<string, unknown>): Robo | undefined {
  return acharRobo(corpo.robo);
}

export type ResultadoSenha = 'ok' | 'errada' | 'nao-configurada';

/** A senha do professor vem da variável de ambiente SIMULADOR_GABARITO_SENHA (Vercel). */
export function conferirSenha(informada: unknown): ResultadoSenha {
  const real = process.env.SIMULADOR_GABARITO_SENHA;
  if (!real) return 'nao-configurada';
  if (typeof informada !== 'string' || informada.length === 0 || informada.length > 200) return 'errada';
  const a = createHash('sha256').update(informada).digest();
  const b = createHash('sha256').update(real).digest();
  return timingSafeEqual(a, b) ? 'ok' : 'errada';
}

export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
