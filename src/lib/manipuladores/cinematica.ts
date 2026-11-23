// Cinemática direta (DH clássica), correção da tabela do aluno e cena do robô alvo.
// T = Rz(θ) · Tz(d) · Tx(a) · Rx(α). Ângulos em graus nas tabelas, comprimentos em metros.

import type { Linha } from './robos';

const D2R = Math.PI / 180;

/** Tolerâncias da correção: 5 mm nos comprimentos, 0,5° nos ângulos. */
export const TOL = { comp: 0.005, ang: 0.5, pos: 0.01, rot: 0.012 };

type Mat = number[]; // 4x4, linha a linha
type V3 = [number, number, number];

const I4 = (): Mat => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function mul(A: Mat, B: Mat): Mat {
  const C = new Array<number>(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += A[i * 4 + k] * B[k * 4 + j];
      C[i * 4 + j] = s;
    }
  return C;
}

function dhMat(a: number, al: number, d: number, th: number): Mat {
  const ct = Math.cos(th), st = Math.sin(th), ca = Math.cos(al), sa = Math.sin(al);
  return [ct, -st * ca, st * sa, a * ct, st, ct * ca, -ct * sa, a * st, 0, sa, ca, d, 0, 0, 0, 1];
}

/** Matrizes T⁰ᵢ de i = 0 a n. q em graus (rotativa) ou metros (prismática). */
export function fk(linhas: Linha[], tipos: string[], q: number[]): Mat[] {
  const T: Mat[] = [I4()];
  for (let i = 0; i < linhas.length; i++) {
    const r = linhas[i];
    const th = (r.th + (tipos[i] === 'R' ? q[i] : 0)) * D2R;
    const d = r.d + (tipos[i] === 'P' ? q[i] : 0);
    T.push(mul(T[i], dhMat(r.a, r.al * D2R, d, th)));
  }
  return T;
}

const angDiff = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function configsDeTeste(tipos: string[], qr: [number, number][], qAtual: number[]): number[][] {
  const rnd = lcg(20261122);
  const out = [qAtual.slice(), tipos.map(() => 0)];
  for (let k = 0; k < 8; k++) out.push(qr.map(([lo, hi]) => lo + (hi - lo) * rnd()));
  return out;
}

export type Veredito = 'ok' | 'equiv' | 'partial' | 'wrong';

export type Correcao = {
  veredito: Veredito;
  celulas: boolean[][]; // [linha][a, α, d, θ]
  acertos: number;
  total: number;
  posicaoOk: boolean;
  orientacaoOk: boolean;
  erroMax: number; // m, pior caso nas configurações de teste
  erroAtual: number; // m, na configuração atual dos sliders
  posAlvo: V3;
  posAluno: V3;
};

const pos = (m: Mat): V3 => [m[3], m[7], m[11]];

/** Compara a tabela do aluno com a referência, célula a célula e pela pose do efetuador. */
export function corrigir(
  ref: Linha[], tipos: string[], aluno: Linha[], qr: [number, number][], qAtual: number[],
): Correcao {
  const chaves: (keyof Linha)[] = ['a', 'al', 'd', 'th'];
  const n = ref.length;
  const celulas: boolean[][] = [];
  let acertos = 0;
  for (let i = 0; i < n; i++) {
    const linha: boolean[] = [];
    for (const k of chaves) {
      const ok = k === 'al' || k === 'th'
        ? angDiff(ref[i][k], aluno[i][k]) <= TOL.ang
        : Math.abs(ref[i][k] - aluno[i][k]) <= TOL.comp;
      linha.push(ok);
      if (ok) acertos++;
    }
    celulas.push(linha);
  }
  let posicaoOk = true, orientacaoOk = true, erroMax = 0;
  for (const q of configsDeTeste(tipos, qr, qAtual)) {
    const A = fk(ref, tipos, q)[n], B = fk(aluno, tipos, q)[n];
    const dp = Math.hypot(A[3] - B[3], A[7] - B[7], A[11] - B[11]);
    let dr = 0;
    for (const idx of [0, 1, 2, 4, 5, 6, 8, 9, 10]) dr = Math.max(dr, Math.abs(A[idx] - B[idx]));
    erroMax = Math.max(erroMax, dp);
    if (dp > TOL.pos) posicaoOk = false;
    if (dr > TOL.rot) orientacaoOk = false;
  }
  const total = n * 4;
  const tN = fk(ref, tipos, qAtual)[n], sN = fk(aluno, tipos, qAtual)[n];
  const erroAtual = Math.hypot(tN[3] - sN[3], tN[7] - sN[7], tN[11] - sN[11]);
  let veredito: Veredito = 'wrong';
  if (acertos === total) veredito = 'ok';
  else if (posicaoOk && orientacaoOk) veredito = 'equiv';
  else if (posicaoOk) veredito = 'partial';
  return { veredito, celulas, acertos, total, posicaoOk, orientacaoOk, erroMax, erroAtual, posAlvo: pos(tN), posAluno: pos(sN) };
}

// ---- cena do robô alvo (mesma regra de desenho usada pelo navegador para o robô do aluno) ----

export type Cilindro = { A: V3; B: V3; r: number; papel: 'link' | 'joint' | 'tool' };
export type EixosFrame = { i: number; O: V3; x: V3; y: V3; z: V3 };

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const esc = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const arred = (v: V3): V3 => [Math.round(v[0] * 1e5) / 1e5, Math.round(v[1] * 1e5) / 1e5, Math.round(v[2] * 1e5) / 1e5];

export function cena(linhas: Linha[], tipos: string[], q: number[], comEixos: boolean) {
  const T = fk(linhas, tipos, q), n = linhas.length;
  const cil: Cilindro[] = [];
  const push = (A: V3, B: V3, r: number, papel: Cilindro['papel']) => cil.push({ A: arred(A), B: arred(B), r, papel });
  for (let i = 0; i < n; i++) {
    const Tp = T[i], O = pos(Tp), z: V3 = [Tp[2], Tp[6], Tp[10]], E = pos(T[i + 1]);
    const d = linhas[i].d + (tipos[i] === 'P' ? q[i] : 0), Q = add(O, esc(z, d));
    if (Math.abs(d) > 1e-6) push(O, Q, 0.018, 'link');
    if (Math.hypot(...sub(E, Q)) > 1e-6) push(Q, E, 0.018, 'link');
    if (tipos[i] === 'R') push(sub(O, esc(z, 0.05)), add(O, esc(z, 0.05)), 0.038, 'joint');
    else push(O, add(O, esc(z, d < 0 ? -0.12 : 0.12)), 0.04, 'joint');
  }
  const Tn = T[n], On = pos(Tn);
  const yn: V3 = [Tn[1], Tn[5], Tn[9]], zn: V3 = [Tn[2], Tn[6], Tn[10]];
  const f1 = add(On, esc(yn, 0.04)), f2 = sub(On, esc(yn, 0.04));
  push(f1, f2, 0.009, 'tool');
  push(f1, add(f1, esc(zn, 0.07)), 0.009, 'tool');
  push(f2, add(f2, esc(zn, 0.07)), 0.009, 'tool');
  const eixos: EixosFrame[] = [];
  if (comEixos) {
    for (let i = 1; i <= n; i++) {
      const M = T[i];
      eixos.push({ i, O: arred(pos(M)), x: arred([M[0], M[4], M[8]]), y: arred([M[1], M[5], M[9]]), z: arred([M[2], M[6], M[10]]) });
    }
  }
  return { cilindros: cil, eixos };
}
