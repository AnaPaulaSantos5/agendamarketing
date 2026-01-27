// app/api/agenda/route.ts
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function authenticate() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo(); // carrega informações da planilha
}

export async function GET(req: Request) {
  try {
    await authenticate();

    // Abas da planilha
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const checklistSheet = doc.sheetsByTitle['Checklist'];

    if (!agendaSheet || !checklistSheet) {
      return NextResponse.json({ error: 'Aba Agenda ou Checklist não encontrada' });
    }

    // Pega todas as linhas
    const agendaRows = await agendaSheet.getRows();
    const checklistRows = await checklistSheet.getRows();

    // Transforma em objetos JS simples
    const agenda = agendaRows.map(row => ({
      date: row.Data,
      time: row.Horario || '',
      title: row.Conteudo_Principal,
      client: row.Cliente || 'Confi',
      secondary: row.Conteudo_Secundario,
      type: row.Tipo,
      link: row.Link_Arquivo,
      cta: row.CTA_WhatsApp,
      status: row.Status_Postagem
    }));

    const checklist = checklistRows.map(row => ({
      id: row.ID,
      text: row.Texto,
      done: row.Concluido === 'TRUE',
      time: row.Horario || ''
    }));

    return NextResponse.json({ agenda, checklist });
  } catch (err: any) {
    console.error('Erro agenda API:', err);
    return NextResponse.json({ error: `Google API error - ${err.message}` });
  }
}
