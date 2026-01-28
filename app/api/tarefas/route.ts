import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

async function auth() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc;
}

// GET tarefas por bloco
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blocoId = searchParams.get('blocoId');

  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];
  const rows = await sheet.getRows();

  return NextResponse.json(
    rows.filter(r => r.Bloco_ID === blocoId)
  );
}

// POST nova tarefa
export async function POST(req: Request) {
  const body = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];

  await sheet.addRow({
    Bloco_ID: body.Bloco_ID,
    Titulo: body.Titulo,
    Responsavel: body.Responsavel,
    Data: body.Data,
    Status: 'Pendente',
    LinkDrive: body.LinkDrive || '',
    Notificar: body.Notificar || 'Não',
  });

  return NextResponse.json({ ok: true });
}