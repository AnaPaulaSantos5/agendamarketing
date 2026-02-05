export async function sendWhatsAppMessage(chatId: string, mensagem: string) {
  // O chatId já vem completo da nossa planilha (ex: 55419999@c.us ou @g.us)
  const res = await fetch(`${process.env.WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: chatId,
      text: mensagem,
      session: process.env.WAHA_SESSION || 'default',
    }),
  });

  if (!res.ok) throw new Error('Erro ao enviar WhatsApp');
  return res.json();
}
