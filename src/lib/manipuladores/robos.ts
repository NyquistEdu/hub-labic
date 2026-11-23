// Configurações clássicas do simulador de manipuladores (convenção DH clássica).
// ATENÇÃO: este arquivo só é importado por rotas de API. As tabelas (`linhas`) são o
// gabarito e nunca devem ir para o navegador sem a senha do professor.

export type Linha = { a: number; al: number; d: number; th: number }; // m, graus, m, graus

export type Robo = {
  id: string;
  grupo: string;
  nome: string;
  tipos: string; // 'R' rotativa, 'P' prismática, uma letra por junta
  linhas: Linha[];
  q0: number[]; // graus (R) ou metros (P)
  qr: [number, number][];
  alvo: [number, number, number]; // ponto que a câmera mira
  dist: number;
  enunciado: string;
  dica: string;
};

export const ROBOS: Robo[] = [
  {
    id: 'rr', grupo: 'Planares', nome: 'Planar RR', tipos: 'RR',
    linhas: [{ a: 0.5, al: 0, d: 0, th: 0 }, { a: 0.4, al: 0, d: 0, th: 0 }],
    q0: [35, -50], qr: [[-170, 170], [-170, 170]], alvo: [0.25, 0, 0.1], dist: 2.9,
    enunciado: 'Braço planar de 2 elos com juntas rotativas de eixo vertical. L₁ = 0,50 m e L₂ = 0,40 m. Base {0}: z₀ vertical, x₀ e y₀ no plano do chão. Com q = 0 o braço fica esticado ao longo de x₀.',
    dica: 'Eixos de junta consecutivos paralelos dão α = 0. Cada comprimento de elo entra como aᵢ. Não há deslocamento ao longo de z, então dᵢ = 0.',
  },
  {
    id: 'rrr', grupo: 'Planares', nome: 'Planar RRR', tipos: 'RRR',
    linhas: [{ a: 0.4, al: 0, d: 0, th: 0 }, { a: 0.3, al: 0, d: 0, th: 0 }, { a: 0.2, al: 0, d: 0, th: 0 }],
    q0: [30, 40, -50], qr: [[-170, 170], [-170, 170], [-170, 170]], alvo: [0.25, 0, 0.1], dist: 2.9,
    enunciado: 'Braço planar de 3 elos, todas as juntas rotativas com eixo vertical. L₁ = 0,40 m, L₂ = 0,30 m, L₃ = 0,20 m. Com q = 0 o braço fica esticado ao longo de x₀.',
    dica: 'Mesma ideia do RR: três eixos paralelos, três comprimentos. A orientação do frame final depende de θ₃.',
  },
  {
    id: 'cart', grupo: 'Configurações clássicas', nome: 'Cartesiano (PPP)', tipos: 'PPP',
    linhas: [{ a: 0, al: -90, d: 0, th: 0 }, { a: 0, al: -90, d: 0, th: -90 }, { a: 0, al: 0, d: 0, th: 0 }],
    q0: [0.25, 0.25, 0.25], qr: [[0, 0.5], [0, 0.5], [0, 0.5]], alvo: [0.2, 0.2, 0.25], dist: 3.2,
    enunciado: 'Três juntas prismáticas ortogonais. A junta 1 sobe ao longo de z₀, a junta 2 desloca ao longo de y₀ e a junta 3 ao longo de x₀. Com q = 0 o efetuador está na origem da base.',
    dica: 'Em junta prismática a variável é d. Cada eixo z precisa ficar perpendicular ao anterior, então use α = ±90° para girar de um eixo ao próximo. Um θ constante alinha os eixos x.',
  },
  {
    id: 'cyl', grupo: 'Configurações clássicas', nome: 'Cilíndrico (RPP)', tipos: 'RPP',
    linhas: [{ a: 0, al: 0, d: 0.3, th: 0 }, { a: 0, al: -90, d: 0, th: 0 }, { a: 0, al: 0, d: 0, th: 0 }],
    q0: [40, 0.15, 0.3], qr: [[-180, 180], [0, 0.4], [0, 0.5]], alvo: [0, 0.2, 0.3], dist: 3.2,
    enunciado: 'Junta 1 rotativa de eixo vertical, com o plano da junta 2 a 0,30 m do chão. Junta 2 prismática vertical. Junta 3 prismática horizontal, no sentido radial. Com q₁ = 0 o eixo radial aponta para +y₀.',
    dica: 'As juntas 1 e 2 têm eixos paralelos (α₁ = 0). A junta 3 é perpendicular à 2, o que pede α₂ = ±90°. A altura de 0,30 m é um d constante.',
  },
  {
    id: 'sph', grupo: 'Configurações clássicas', nome: 'Esférico (RRP)', tipos: 'RRP',
    linhas: [{ a: 0, al: -90, d: 0.3, th: 0 }, { a: 0, al: 90, d: 0.1, th: 90 }, { a: 0, al: 0, d: 0, th: 0 }],
    q0: [30, -25, 0.35], qr: [[-170, 170], [-80, 80], [0, 0.5]], alvo: [0.2, 0.1, 0.35], dist: 3.2,
    enunciado: 'Ombro a 0,30 m do chão: junta 1 vertical, junta 2 com eixo horizontal deslocado 0,10 m lateralmente (ao longo do próprio eixo), junta 3 prismática que estende o braço. Com q₂ = 0 o braço fica horizontal, apontando para +x₀.',
    dica: 'Os eixos z₀, z₁ e z₂ são ortogonais dois a dois (α = −90° e +90°). Como o braço está na horizontal em q₂ = 0, o θ₂ tem uma parte constante de 90°.',
  },
  {
    id: 'scara', grupo: 'Configurações clássicas', nome: 'SCARA (RRPR)', tipos: 'RRPR',
    linhas: [{ a: 0.4, al: 0, d: 0.3, th: 0 }, { a: 0.3, al: 180, d: 0, th: 0 }, { a: 0, al: 0, d: 0, th: 0 }, { a: 0, al: 0, d: 0.1, th: 0 }],
    q0: [30, 60, 0.1, 20], qr: [[-130, 130], [-145, 145], [0, 0.2], [-180, 180]], alvo: [0.3, 0.2, 0.15], dist: 3.2,
    enunciado: 'SCARA: junta 1 a 0,30 m do chão, elos horizontais de 0,40 m e 0,30 m com juntas 1 e 2 rotativas verticais. A junta 3 é prismática e desce. A junta 4 gira a ferramenta, que fica 0,10 m abaixo. Com q = 0 o braço está esticado ao longo de x₀.',
    dica: 'Para a junta prismática descer, o eixo z₂ deve apontar para baixo: pense em α₂ = 180°. A altura de 0,30 m e a ferramenta de 0,10 m são d constantes.',
  },
  {
    id: 'anth', grupo: 'Configurações clássicas', nome: 'Antropomórfico (RRR)', tipos: 'RRR',
    linhas: [{ a: 0, al: 90, d: 0.3, th: 0 }, { a: 0.4, al: 0, d: 0, th: 0 }, { a: 0.3, al: 0, d: 0, th: 0 }],
    q0: [25, 50, -70], qr: [[-170, 170], [-90, 150], [-150, 150]], alvo: [0.3, 0, 0.35], dist: 3.2,
    enunciado: 'Ombro a 0,30 m do chão. Junta 1 vertical, juntas 2 e 3 com eixos horizontais paralelos entre si. L₂ = 0,40 m e L₃ = 0,30 m. Com q = 0 o braço fica esticado ao longo de x₀.',
    dica: 'z₀ é vertical e z₁ é horizontal: α₁ = ±90°. As juntas 2 e 3 são paralelas (α₂ = 0), e os elos entram como a₂ e a₃. O d₁ é a altura do ombro.',
  },
  {
    id: 'six', grupo: 'Configurações clássicas', nome: 'Antropomórfico com punho esférico (6R)', tipos: 'RRRRRR',
    linhas: [
      { a: 0, al: 90, d: 0.3, th: 0 }, { a: 0.4, al: 0, d: 0, th: 0 }, { a: 0.35, al: 0, d: 0, th: 0 },
      { a: 0, al: 90, d: 0, th: 0 }, { a: 0, al: -90, d: 0, th: 0 }, { a: 0, al: 0, d: 0.12, th: 0 },
    ],
    q0: [20, 40, -60, 30, 45, -30],
    qr: [[-170, 170], [-90, 150], [-150, 150], [-170, 170], [-120, 120], [-170, 170]],
    alvo: [0.3, 0, 0.4], dist: 3.4,
    enunciado: 'Braço antropomórfico (ombro a 0,30 m, L₂ = 0,40 m, L₃ = 0,35 m) com punho esférico: os eixos das juntas 4, 5 e 6 se cruzam no mesmo ponto. O flange fica 0,12 m após o punho. Com q = 0 o braço está esticado ao longo de x₀.',
    dica: 'As três primeiras linhas seguem o antropomórfico. No punho, os eixos z₃, z₄, z₅ são ortogonais em sequência (α₄ = 90°, α₅ = −90°) e as origens coincidem (a = d = 0). Só a última linha tem d (flange).',
  },
];

export function acharRobo(id: unknown): Robo | undefined {
  return typeof id === 'string' ? ROBOS.find((r) => r.id === id) : undefined;
}
