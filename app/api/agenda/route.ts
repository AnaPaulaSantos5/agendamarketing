import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function GET(req: Request) {
  try {
    // autenticação via JWT
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // criar doc
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Agenda'];
    if (!sheet) return NextResponse.json({ error: 'Aba Agenda não encontrada' }, { status: 404 });

    const rows = await sheet.getRows();

    // Mapear os dados da planilha
    const agendaRaw = rows.map(row => ({
      date: row.Data,                     // Data do post
      principal: row.Conteudo_Principal,  // Conteúdo principal
      secundario: row.Conteudo_Secundario,// Conteúdo secundário
      tipo: row.Tipo,                      // Story, Reel, Post
      link: row.Link_Arquivo,              // Link do arquivo ou vídeo
      alternativa: row.Alternativa_Pronta,// Alternativa pronta
      cta: row.CTA_WhatsApp,               // CTA WhatsApp
      status: row.Status_Postagem,         // Status Pendente/Pronto
    }));

    // --- Estruturação por blocos e filtros ---
    // Ex.: filtrar por mês, tipo de conteúdo ou status
    const url = new URL(req.url);
    const monthFilter = url.searchParams.get('month'); // "01" = Janeiro, "02" = Fevereiro...
    const typeFilter = url.searchParams.get('tipo');   // "Story", "Reel", "Post"
    const statusFilter = url.searchParams.get('status'); // "Pendente" ou "Pronto"

    let agenda = agendaRaw;

    if (monthFilter) {
      agenda = agenda.filter(item => {
        const itemMonth = new Date(item.date).getMonth() + 1; // 0-based
        return itemMonth === Number(monthFilter);
      });
    }

    if (typeFilter) {
      agenda = agenda.filter(item => item.tipo.toLowerCase() === typeFilter.toLowerCase());
    }

    if (statusFilter) {
      agenda = agenda.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Criar blocos mensais + checklist diário
    const agendaByMonth: Record<string, any[]> = {};

    agenda.forEach(item => {
      const d = new Date(item.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!agendaByMonth[monthKey]) agendaByMonth[monthKey] = [];

      agendaByMonth[monthKey].push({
        ...item,
        day: d.getDate(),
        checklist: item.status.toLowerCase() === 'pronto' ? true : false
      });
    });

    return NextResponse.json({ agendaByMonth });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
