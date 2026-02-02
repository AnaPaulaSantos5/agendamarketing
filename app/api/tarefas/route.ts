import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc.sheetsByTitle['Tarefas'];
}

// GET: retorna tarefas de um Bloco específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blocoId = searchParams.get('blocoId');
    if (!blocoId) return NextResponse.json([], { status: 400 });

    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();
    const filtered = rows.filter(r => String(r.Bloco_ID) === blocoId);

    return NextResponse.json(filtered);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST: cria nova tarefa
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sheet = await accessSpreadsheet();

    await sheet.addRow({
      Bloco_ID: body.Bloco_ID,
      Titulo: body.Titulo,
      Responsavel: body.Responsavel,
      ResponsavelChatId: body.ResponsavelChatId || '',
      Data: body.Data,
      Status: 'Pendente',
      LinkDrive: body.LinkDrive || '',
      Notificar: body.Notificar || 'Não',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: atualiza tarefa existente
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();

    const row = rows.find(r => r.Bloco_ID === body.Bloco_ID);
    if (!row) throw new Error('Tarefa não encontrada');

    row.Titulo = body.Titulo || row.Titulo;
    row.Responsavel = body.Responsavel || row.Responsavel;
    row.ResponsavelChatId = body.ResponsavelChatId || row.ResponsavelChatId;
    row.Data = body.Data || row.Data;
    row.Status = body.Status || row.Status;
    row.LinkDrive = body.LinkDrive || row.LinkDrive;
    row.Notificar = body.Notificar || row.Notificar;

    await row.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE: remove tarefa
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();

    const row = rows.find(r => r.Bloco_ID === body.Bloco_ID);
    if (!row) throw new Error('Tarefa não encontrada');

    await row.delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}