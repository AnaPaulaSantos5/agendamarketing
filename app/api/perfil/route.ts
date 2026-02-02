import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function getPerfilSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc.sheetsByTitle['Perfil'];
}

export async function GET() {
  const sheet = await getPerfilSheet();
  const rows = await sheet.getRows();

  return NextResponse.json(
    rows.map(r => ({
      perfil: r.Perfil,
      chatId: r.ChatId || '',
      image: r.Image || '',
    }))
  );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const sheet = await getPerfilSheet();
  const rows = await sheet.getRows();

  const row = rows.find(r => r.Perfil === body.perfil);
  if (!row) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  }

  row.ChatId = body.chatId ?? row.ChatId;
  row.Image = body.image ?? row.Image;

  await row.save();

  return NextResponse.json({ ok: true });
}
