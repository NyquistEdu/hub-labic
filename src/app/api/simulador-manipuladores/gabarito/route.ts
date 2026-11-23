import { conferirSenha, erro, esperar, lerCorpo, resposta, roboDoCorpo } from '@/lib/manipuladores/api';

export const dynamic = 'force-dynamic';

/** Tabela DH de referência. Só responde com a senha do professor. */
export async function POST(req: Request) {
  const corpo = await lerCorpo(req);
  if (!corpo) return erro('Pedido inválido.');
  const robo = roboDoCorpo(corpo);
  if (!robo) return erro('Configuração desconhecida.');
  const s = conferirSenha(corpo.senha);
  if (s === 'nao-configurada') return erro('O gabarito ainda não foi configurado no servidor.', 503);
  if (s === 'errada') {
    await esperar(700);
    return erro('Senha incorreta.', 401);
  }
  return resposta({ robo: robo.id, tipos: robo.tipos, linhas: robo.linhas });
}
