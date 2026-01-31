export function parseResposta(text: string) {
  if (!text) return null
  if (text.trim().startsWith('1')) return 'SIM'
  if (text.trim().startsWith('2')) return 'NAO'
  return null
}