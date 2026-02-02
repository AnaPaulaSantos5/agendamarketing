// app/api/perfil/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

export async function PATCH(req: NextRequest) {
  try {
    const { perfil, chatId } = await req.json();
    if (!perfil || !chatId) throw new Error('Dados incompletos');

    const doc = await auth();
    const sheet = doc.sheetsByTitle['Tarefas'];
    const rows = await sheet.getRows();

    // Atualiza todos os registros do perfil com o novo ChatID
    rows.forEach(r => {
      if (r.Responsavel === perfil) {
        r.ResponsavelChatId = chatId;
        r.save().catch(console.error);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro ao atualizar ChatID:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}