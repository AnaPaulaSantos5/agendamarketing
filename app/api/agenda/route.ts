import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function auth() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
}

export async function GET() {
  try {
    await auth();
    const sheet = doc.sheetsByTitle['Agenda'];
    const rows = await sheet.getRows();

    const events = rows.map(row => ({
      id: row.ID,
      title: row.Titulo,
      start: row.Inicio,
      end: row.Fim,
      extendedProps: {
        profile: row.Perfil,
        type: row.Tipo,
        linkDrive: row.LinkDrive,
        status: row.Status,
      },
    }));

    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar agenda' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await auth();
    const sheet = doc.sheetsByTitle['Agenda'];

    await sheet.addRow({
      ID: body.id,
      Titulo: body.title,
      Inicio: body.start,
      Fim: body.end,
      Perfil: body.extendedProps.profile,
      Tipo: body.extendedProps.type,
      LinkDrive: body.extendedProps.linkDrive || '',
      Status: body.extendedProps.status || 'Pendente',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 });
  }
}