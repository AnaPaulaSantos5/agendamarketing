import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender';
import { buildWhatsAppMessage } from '@/lib/whatsapp/template';
import { formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fuso = 'America/Sao_Paulo';
    const agora = new Date();
    
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    // 1. Saudação Inteligente (Curitiba)
    const horaAtual = parseInt(formatInTimeZone(agora, fuso, 'H'));
    let saudacaoReal = "Olá";
    if (horaAtual >= 5 && horaAtual < 12) saudacaoReal = "Bom dia";
    else if (horaAtual >= 12 && horaAtual < 18) saudacaoReal = "Boa tarde";
    else saudacaoReal = "Boa noite";

    const sheetTarefas = doc.sheetsByTitle['Tarefas'];
    const rowsTarefas = await sheetTarefas.getRows();
    const sheetAgenda = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await sheetAgenda.getRows();

    let disparados = 0;

    for (const row of rowsTarefas) {
        const dataEventoStr = row.get('Data'); 
        const status = row.get('Status');
        const notificar = row.get('Notificar');

        if (status === 'Pendente' && notificar === 'Sim' && dataEventoStr) {
            try {
                // Converte data da planilha para o objeto Date real
                const dataFormatada = dataEventoStr.replace(' ', 'T') + ':00-03:00';
                const dataEvento = new Date(dataFormatada);
                
                if (isNaN(dataEvento.getTime())) continue;

                // Chegou o momento do disparo?
                if (dataEvento <= agora) {
                     const chatId = row.get('ResponsavelChatId');
                     const nome = row.get('Responsavel');
                     const titulo = row.get('Titulo');

                     if (chatId) {
                        // Busca o conteúdo alternativo na aba Agenda para enriquecer a mensagem
                        const evAgenda = rowsAgenda.find(ra => ra.get('Conteudo_Principal') === titulo);

                        const msg = buildWhatsAppMessage({
                            nome: nome,
                            saudacao: saudacaoReal,
                            conteudoPrincipal: titulo,
                            conteudoSecundario: evAgenda ? evAgenda.get('Conteudo_Secundario') : '', 
                            linkDrive: row.get('LinkDrive')
                        });

                        await sendWhatsAppMessage(chatId, msg, nome, titulo);
                        
                        row.set('Status', 'Enviado');
                        await row.save();
                        disparados++;
                     }
                }
            } catch (err) { console.error(`Erro na linha ${row.get('Titulo')}:`, err); }
        }
    }

    return NextResponse.json({ success: true, disparados, hora_curitiba: horaAtual });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}