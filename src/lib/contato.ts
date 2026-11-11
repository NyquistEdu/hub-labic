export const ASSUNTOS = {
  PARCERIA: 'Parceria de pesquisa ou com empresa',
  PARTICIPAR: 'Quero participar do LABIC',
  VISITA: 'Visita ao laboratório',
  IMPRENSA: 'Imprensa',
  OUTRO: 'Outro assunto',
} as const;
export type Assunto = keyof typeof ASSUNTOS;

export interface Mensagem {
  id: string;
  nome: string;
  email: string;
  assunto: Assunto;
  mensagem: string;
  respondida: boolean;
  criado_em: string;
}
