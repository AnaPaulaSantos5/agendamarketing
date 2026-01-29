// app/api/checklist/route.ts
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function auth() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc;
}

export async function GET() {
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Checklist'];
  const rows = await sheet.getRows();
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Checklist'];
  const row = (await sheet.getRows()).find(r => r.ID === id);
  if (row) {
    row.Done = done ? 'Sim' : 'Não';
    await row.save();
  }
  return NextResponse.json({ ok: true });
}
