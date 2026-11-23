import { createHash, scryptSync, timingSafeEqual } from 'node:crypto';
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

// Hash scrypt da senha do professor (a senha em si não fica no repositório).
// Para trocar a senha, gere um novo registro "scrypt$sal$hash" e substitua esta linha.
const SENHA_PADRAO = 'scrypt$5fa864aa45b6493a7a382156980b8e64$8c73e624ed8c7cc3ab6cdd886e7d04b9ba07d591ee93c1e164c1480b41ecfea1';

function iguais(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Confere a senha do professor no servidor. Se SIMULADOR_GABARITO_SENHA existir, ela vale no lugar do hash padrão. */
export function conferirSenha(informada: unknown): ResultadoSenha {
  if (typeof informada !== 'string' || informada.length === 0 || informada.length > 200) {
    return process.env.SIMULADOR_GABARITO_SENHA || SENHA_PADRAO ? 'errada' : 'nao-configurada';
  }
  const env = process.env.SIMULADOR_GABARITO_SENHA;
  if (env) {
    const a = createHash('sha256').update(informada).digest();
    const b = createHash('sha256').update(env).digest();
    return iguais(a, b) ? 'ok' : 'errada';
  }
  const [tipo, sal, hash] = SENHA_PADRAO.split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return 'nao-configurada';
  const calc = scryptSync(informada, Buffer.from(sal, 'hex'), 32, { N: 16384, r: 8, p: 1 });
  return iguais(calc, Buffer.from(hash, 'hex')) ? 'ok' : 'errada';
}

export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
