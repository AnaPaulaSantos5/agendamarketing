import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function access() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc.sheetsByTitle['Perfil'];
}

// ✅ GET → carregar perfis ao abrir a página
export async function GET() {
  const sheet = await access();
  const rows = await sheet.getRows();

  const map: any = {};
  rows.forEach(r => {
    map[r.Perfil] = {
      chatId: r.ChatId || '',
      image: r.Image || '',
    };
  });

  return NextResponse.json(map);
}

// ✅ PATCH → salvar chatId
export async function PATCH(req: NextRequest) {
  const { perfil, chatId } = await req.json();
  const sheet = await access();
  const rows = await sheet.getRows();

  const row = rows.find(r => r.Perfil === perfil);
  if (!row) throw new Error('Perfil não encontrado');

  row.ChatId = chatId;
  await row.save();

  return NextResponse.json({ ok: true });
}
