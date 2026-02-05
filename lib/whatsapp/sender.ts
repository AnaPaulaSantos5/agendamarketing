import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function sendWhatsAppMessage(chatId: string, mensagem: string, nome: string, evento: string) {
  // 1. Limpeza e Formatação do Número (Garante o @c.us e DDI 55)
  let cleanNumber = chatId.replace(/\D/g, ''); // Remove tudo que não é número
  if (!cleanNumber.startsWith('55')) cleanNumber = `55${cleanNumber}`;
  
  // Tratamento do nono dígito para evitar erro 500 no WAHA
  if (cleanNumber.length === 13) {
    cleanNumber = cleanNumber.slice(0, 4) + cleanNumber.slice(5);
  }
  const finalChatId = `${cleanNumber}@c.us`;

  // 2. Enviar via WAHA
  const res = await fetch(`${process.env.WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.WAHA_API_KEY || '' 
    },
    body: JSON.stringify({
      chatId: finalChatId,
      text: mensagem,
      session: process.env.WAHA_SESSION || 'default',
    }),
  });

  if (!res.ok) throw new Error('Erro ao enviar WhatsApp via WAHA');

  // 3. Registrar no WhatsApp_Feed da Planilha
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
    Telefone: finalChatId,
    Evento: evento,
    Resposta: '-',
    Data: new Date().toLocaleString('pt-BR')
  });

  return res.json();
}
