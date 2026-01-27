import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet({
  spreadsheetId: process.env.GOOGLE_SHEET_ID!,
});

async function authenticate() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo(); // carrega informações da planilha
}

export async function GET() {
  try {
    await authenticate();

    const sheet = doc.sheetsByIndex[0]; // primeira aba
    const rows = await sheet.getRows();

    // transforma em JSON simples
    const data = rows.map((row) => ({
      date: row.Data,
      principal: row.Conteudo_Principal,
      secundario: row.Conteudo_Secundario,
      tipo: row.Tipo,
      link: row.Link_Arquivo,
      alternativa: row.Alternativa_Pronta,
      cta: row.CTA_WhatsApp,
      status: row.Status_Postagem,
    }));

    return NextResponse.json({ agenda: data });
  } catch (err: any) {
    return NextResponse.json({ error: `Google API error - ${err.message}` });
  }
}
