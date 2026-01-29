import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Checklist'];
  const rows = await sheet.getRows();
  // Converte cada linha em objeto e transforma Done em boolean
  const data = rows.map(r => ({
    id: r.ID,
    date: r.Data,
    client: r.Cliente,
    task: r.Tarefa,
    done: r.Done === 'Sim' || r.Done === 'TRUE' || r.Done === true,
  }));
  return data;
}

export async function GET(req: NextRequest) {
  try {
    const data = await accessSpreadsheet();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Atualiza status do item
export async function PATCH(req: NextRequest) {
  try {
    const { id, done } = await req.json();
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Checklist'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.ID === id);
    if (row) {
      row.Done = done ? 'Sim' : 'Não';
      await row.save();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
