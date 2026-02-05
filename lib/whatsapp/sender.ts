import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function sendWhatsAppMessage(chatId: string, mensagem: string, nome: string, evento: string) {
  // 1. Enviar via WAHA
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

  // 2. Registrar no WhatsApp_Feed da Planilha
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();
  const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];

  await feedSheet.addRow({
    Tipo: 'ENVIO',
    Nome: nome,
    Telefone: chatId,
    Evento: evento,
    Resposta: '-',
    Data: new Date().toLocaleString('pt-BR')
  });

  return res.json();
}
