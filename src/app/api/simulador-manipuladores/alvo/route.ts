import { cena } from '@/lib/manipuladores/cinematica';
import { conferirSenha, erro, esperar, lerCorpo, numeros, resposta, roboDoCorpo } from '@/lib/manipuladores/api';

export const dynamic = 'force-dynamic';

/** Desenho do robô alvo na configuração q. Os eixos dos frames só saem com a senha. */
export async function POST(req: Request) {
  const corpo = await lerCorpo(req);
  if (!corpo) return erro('Pedido inválido.');
  const robo = roboDoCorpo(corpo);
  if (!robo) return erro('Configuração desconhecida.');
  const q = numeros(corpo.q, robo.tipos.length);
  if (!q) return erro('Valores de q inválidos.');
  let comEixos = false;
  if (corpo.eixos === true) {
    const s = conferirSenha(corpo.senha);
    if (s === 'nao-configurada') return erro('Gabarito ainda não configurado no servidor.', 503);
    if (s === 'errada') {
      await esperar(700);
      return erro('Senha incorreta.', 401);
    }
    comEixos = true;
  }
  return resposta({ robo: robo.id, ...cena(robo.linhas, robo.tipos.split(''), q, comEixos) });
}
