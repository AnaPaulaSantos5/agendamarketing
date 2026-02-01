import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { randomUUID } from 'crypto';
import { AgendaEvent, Perfil } from '@/app/components/types';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
const SHEET_NAME = 'Agenda';

/* ========= GET ========= */
export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[SHEET_NAME];
  const rows = await sheet.getRows();

  const events: AgendaEvent[] = rows.map(r => ({
    id: r.ID,
    start: r.Data_Inicio,
    end: r.Data_Fim,
    conteudoPrincipal: r.Conteudo_Principal,
    conteudoSecundario: r.Conteudo_Secundario,
    cta: r.CTA,
    statusPostagem: r.Status,
    perfil: r.Perfil as Perfil,
    tipoEvento: r.Tipo,
  }));

  return NextResponse.json(events);
}

/* ========= POST ========= */
export async function POST(req: Request) {
  const body = await req.json();

  const row = {
    ID: randomUUID(),
    Data_Inicio: body.start,
    Data_Fim: body.end,
    Conteudo_Principal: body.conteudoPrincipal,
    Conteudo_Secundario: body.conteudoSecundario ?? '',
    CTA: body.cta ?? '',
    Status: body.statusPostagem ?? 'Pendente',
    Perfil: body.perfil,
    Tipo: body.tipoEvento ?? 'Perfil',
  };

  await doc.loadInfo();
  await doc.sheetsByTitle[SHEET_NAME].addRow(row);

  return NextResponse.json(row);
}

/* ========= PATCH ========= */
export async function PATCH(req: Request) {
  const body = await req.json();
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[SHEET_NAME];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.ID === body.id);

  if (!row) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  row.Data_Inicio = body.start;
  row.Data_Fim = body.end;
  row.Conteudo_Principal = body.conteudoPrincipal;
  row.Perfil = body.perfil;

  await row.save();
  return NextResponse.json({ ok: true });
}

/* ========= DELETE ========= */
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[SHEET_NAME];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.ID === id);

  if (row) await row.delete();
  return NextResponse.json({ ok: true });
}