import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function authenticate() {
  await doc.useServiceAccountAuth({
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    privateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
}

export async function GET() {
  try {
    await authenticate();

    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const agendaRows = await agendaSheet.getRows();

    const checklistSheet = doc.sheetsByTitle['Checklist'];
    const checklistRows = await checklistSheet.getRows();

    const agenda = agendaRows.map(r => ({
      date: r.Data,
      type: r.Tipo,
      main: r.Conteudo_Principal,
      secondary: r.Conteudo_Secundario,
      cta: r.CTA_WhatsApp,
      status: r.Status_Postagem,
      profile: r.Perfil,
    }));

    const checklist = checklistRows.map(r => ({
      id: r.ID,
      date: r.Data,
      client: r.Cliente,
      task: r.Tarefa,
      done: r.Done === 'true',
    }));

    return NextResponse.json({ agenda, checklist });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: `Google API error - ${err.message}` });
  }
}
