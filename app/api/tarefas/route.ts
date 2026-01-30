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

// GET tarefas (opcionalmente filtrando por Bloco_ID)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blocoId = searchParams.get('blocoId');
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];
  const rows = await sheet.getRows();

  const filteredRows = blocoId
    ? rows.filter(r => String(r.Bloco_ID) === String(blocoId))
    : rows;

  return NextResponse.json(filteredRows);
}

// POST nova tarefa
export async function POST(req: Request) {
  const body = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];

  await sheet.addRow({
    Bloco_ID: body.Bloco_ID,
    Titulo: body.Titulo,
    Responsavel: body.Responsavel || '',
    ResponsavelChatID: body.ResponsavelChatID || '', // ✅ novo campo
    Data: body.Data || '',
    Status: body.Status || 'Pendente',
    LinkDrive: body.LinkDrive || '',
    Notificar: body.Notificar || 'Não',
  });

  return NextResponse.json({ ok: true });
}

// PATCH editar tarefa
export async function PATCH(req: Request) {
  const body = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];
  const rows = await sheet.getRows();

  const row = rows.find(r => String(r.Bloco_ID) === String(body.Bloco_ID));
  if (!row) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });

  row.Titulo = body.Titulo || row.Titulo;
  row.Responsavel = body.Responsavel || row.Responsavel;
  row.ResponsavelChatID = body.ResponsavelChatID || row.ResponsavelChatID; // ✅ atualizado
  row.Data = body.Data || row.Data;
  row.Status = body.Status || row.Status;
  row.LinkDrive = body.LinkDrive || row.LinkDrive;
  row.Notificar = body.Notificar || row.Notificar;

  await row.save();

  return NextResponse.json({ ok: true });
}

// DELETE tarefa
export async function DELETE(req: Request) {
  const body = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Tarefas'];
  const rows = await sheet.getRows();

  const row = rows.find(r => String(r.Bloco_ID) === String(body.Bloco_ID));
  if (row) await row.delete();

  return NextResponse.json({ ok: true });
}
