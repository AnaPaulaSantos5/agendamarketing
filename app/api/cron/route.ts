import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender';
import { buildWhatsAppMessage } from '@/lib/whatsapp/template';

// Força o Vercel a não guardar cache dessa rota (essencial para CRON)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("⏰ CRON INICIADO: Verificando disparos...");

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Tarefas'];
    const rows = await sheet.getRows();

    // Data Atual REAL (UTC) - O Vercel sabe que horas são no mundo
    const agora = new Date();
    
    let disparados = 0;

    for (const row of rows) {
        const dataEventoStr = row.get('Data'); // Ex: "2026-02-05 14:00"
        const status = row.get('Status');
        const notificar = row.get('Notificar');

        if (status === 'Pendente' && notificar === 'Sim' && dataEventoStr) {
            try {
                // TRUQUE DO FUSO HORÁRIO:
                // Pegamos a string "2026-02-05 14:00", trocamos espaço por T
                // E adicionamos "-03:00" no final para dizer "Isso é hora do Brasil"
                // Resultado: "2026-02-05T14:00:00-03:00"
                const dataFormatada = dataEventoStr.replace(' ', 'T') + ':00-03:00';
                const dataEvento = new Date(dataFormatada);
                
                // Se a data do evento for inválida, pula
                if (isNaN(dataEvento.getTime())) {
                    console.log(`Data inválida na linha ${row.rowIndex}: ${dataEventoStr}`);
                    continue;
                }

                // COMPARAÇÃO UNIVERSAL:
                // O Javascript converte tudo para milissegundos universais.
                // Se o momento do evento (Brasil) for MENOR ou IGUAL ao momento agora (Mundo), dispara.
                if (dataEvento <= agora) {
                     const chatId = row.get('ResponsavelChatId');
                     const nome = row.get('Responsavel');
                     const titulo = row.get('Titulo');

                     if (chatId) {
                        console.log(`🚀 Disparando para ${nome} (${titulo})`);

                        // Constrói a mensagem bonita
                        const msg = buildWhatsAppMessage({
                            nome: nome,
                            conteudoPrincipal: titulo,
                            linkDrive: row.get('LinkDrive')
                        });

                        // Envia (usando sua função existente)
                        // Atenção: Confirme se sendWhatsAppMessage aceita (chatId, texto, nome, titulo)
                        await sendWhatsAppMessage(chatId, msg, nome, titulo);
                        
                        // Marca como enviado para não repetir
                        row.set('Status', 'Enviado');
                        await row.save();
                        disparados++;
                     }
                }
            } catch (err) {
                console.error(`Erro ao processar linha: ${err}`);
            }
        }
    }

    console.log(`✅ CRON FINALIZADO. Disparados: ${disparados}`);
    return NextResponse.json({ success: true, disparados });
  } catch (error: any) {
    console.error("❌ ERRO NO CRON:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
