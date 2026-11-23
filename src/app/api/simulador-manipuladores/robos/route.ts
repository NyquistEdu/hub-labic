import { ROBOS } from '@/lib/manipuladores/robos';
import { resposta } from '@/lib/manipuladores/api';

export const dynamic = 'force-dynamic';

/** Lista pública das configurações. Não inclui as tabelas DH (gabarito). */
export async function GET() {
  return resposta({
    robos: ROBOS.map((r) => ({
      id: r.id, grupo: r.grupo, nome: r.nome, tipos: r.tipos, q0: r.q0, qr: r.qr,
      alvo: r.alvo, dist: r.dist, enunciado: r.enunciado, dica: r.dica,
    })),
  });
}
