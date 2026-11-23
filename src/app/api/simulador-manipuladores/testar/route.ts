import { corrigir } from '@/lib/manipuladores/cinematica';
import { erro, lerCorpo, numeros, resposta, roboDoCorpo, tabela } from '@/lib/manipuladores/api';

export const dynamic = 'force-dynamic';

/** Corrige a tabela do aluno contra a referência (que fica só no servidor). */
export async function POST(req: Request) {
  const corpo = await lerCorpo(req);
  if (!corpo) return erro('Pedido inválido.');
  const robo = roboDoCorpo(corpo);
  if (!robo) return erro('Configuração desconhecida.');
  const n = robo.tipos.length;
  const aluno = tabela(corpo.tabela, n);
  const q = numeros(corpo.q, n);
  if (!aluno || !q) return erro('Tabela ou valores de q inválidos.');
  return resposta({ robo: robo.id, ...corrigir(robo.linhas, robo.tipos.split(''), aluno, robo.qr, q) });
}
