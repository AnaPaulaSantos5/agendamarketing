import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { AgendaEvent } from '@/app/components/types';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);

export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  const events: AgendaEvent[] = rows.map((r) => ({
    id: r.ID,
    start: r.Data_Inicio,
    end: r.Data_Fim,
    conteudoPrincipal: r.Conteudo_Principal,
    conteudoSecundario: r.Conteudo_Secundario,
    cta: r.CTA,
    statusPostagem: r.Status,
    perfil: r.Perfil,
    tipoEvento: r.Tipo,
  }));

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  await doc.loadInfo();
  await doc.sheetsByTitle['Agenda'].addRow(body);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.ID === body.id);
  if (!row) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  Object.assign(row, body);
  await row.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.ID === id);
  if (row) await row.delete();
  return NextResponse.json({ ok: true });
}
