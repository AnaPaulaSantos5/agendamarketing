export function parseResposta(text: string) {
  if (!text) return null;
  
  const cleanText = text.trim();

  // De acordo com seu novo template:
  // 1. Sim (Deseja contactar o Marketing? -> Precisa de ajuda)
  if (cleanText.startsWith('1')) return 'SIM';
  
  // 2. Não (Deseja contactar o Marketing? -> Está de acordo)
  if (cleanText.startsWith('2')) return 'NAO';
  
  return null;
}