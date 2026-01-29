import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc.sheetsByTitle['Checklist'];
}

// GET todos itens do checklist
export async function GET() {
  try {
    const sheet = await accessSpreadsheet();
    const rows = await sheet.getRows();
    const checklist = rows.map(r => ({
      id: r.ID,
      date: r.Data,
      client: r.Cliente,
      task: r.Tarefa,
      done: r.Done === 'Sim', // ajusta para booleano
    }));
    return NextResponse.json(checklist);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH para atualizar status do item
export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    const sheet = await accessSpreadsheet();
    const row = (await sheet.getRows()).find(r => r.ID === id);
    if (!row) throw new Error('Item não encontrado');
    row.Done = done ? 'Sim' : 'Não';
    await row.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
