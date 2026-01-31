import fetch from 'node-fetch'

export async function sendWhatsAppMessage(
  telefone: string,
  mensagem: string
) {
  const res = await fetch(`${process.env.WAHA_URL}/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: `${telefone}@c.us`,
      text: mensagem,
      session: 'default',
    }),
  })

  if (!res.ok) {
    throw new Error('Erro ao enviar WhatsApp')
  }
}