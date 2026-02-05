import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender';
import { buildWhatsAppMessage } from '@/lib/whatsapp/template';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Tarefas'];
    const rows = await sheet.getRows();

    // Data/Hora atual em SP
    const agora = new Date();
    agora.setHours(agora.getHours() - 3); // Ajuste fuso horário simples se necessário
    
    let disparados = 0;

    for (const row of rows) {
        // Formato esperado na planilha: "2026-02-05 14:00" ou apenas a Data
        const dataEventoStr = row.get('Data'); // Vem da coluna Data na aba Tarefas
        const status = row.get('Status');
        const notificar = row.get('Notificar');

        if (status === 'Pendente' && notificar === 'Sim' && dataEventoStr) {
            // Tenta criar uma data com o valor da planilha
            // Se na planilha estiver "2026-02-05 15:30", o Date consegue ler
            const dataEvento = new Date(dataEventoStr);
            
            // Se a data do evento já passou ou é agora (com margem de erro)
            if (dataEvento <= agora) {
                 const chatId = row.get('ResponsavelChatId');
                 const nome = row.get('Responsavel');
                 const titulo = row.get('Titulo');

                 if (chatId) {
                    const msg = buildWhatsAppMessage({
                        nome: nome,
                        conteudoPrincipal: titulo,
                        linkDrive: row.get('LinkDrive')
                    });

                    // Envia e atualiza planilha
                    await sendWhatsAppMessage(chatId, msg, nome, titulo);
                    row.set('Status', 'Enviado');
                    await row.save();
                    disparados++;
                 }
            }
        }
    }

    return NextResponse.json({ success: true, disparados });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
