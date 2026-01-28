import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

async function getSheet() {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  });
  await doc.loadInfo();
  return doc.sheetsByTitle['Agenda'];
}

/* =========================
   GET — LISTAR EVENTOS
   ========================= */
export async function GET() {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();

    const events = rows.map(row => ({
      id: row.id,
      title: row.title,
      start: row.start,
      end: row.end,
      extendedProps: {
        profile: row.profile,
        type: row.type,
        linkDrive: row.linkDrive,
        status: row.status,
      },
    }));

    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao buscar agenda' }, { status: 500 });
  }
}

/* =========================
   POST — CRIAR EVENTO
   ========================= */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const sheet = await getSheet();

    await sheet.addRow({
      id: data.id,
      title: data.title,
      start: data.start,
      end: data.end,
      profile: data.extendedProps.profile,
      type: data.extendedProps.type,
      linkDrive: data.extendedProps.linkDrive || '',
      status: data.extendedProps.status || 'Pendente',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 });
  }
}