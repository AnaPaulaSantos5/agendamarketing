import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function GET() {
 try {
  // 1️⃣ Instancia a planilha apenas com o ID
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

  // 2️⃣ Autentica via Service Account
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  // 3️⃣ Carrega info da planilha
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['Agenda'];
  if (!sheet) {
    return NextResponse.json({ error: 'Aba Agenda não encontrada' }, { status: 404 });
  }

  const rows = await sheet.getRows();
  const agenda = rows.map(row => ({
    date: row['Data'] || '',
    principal: row['Conteudo_Principal'] || '',
    secundario: row['Conteudo_Secundario'] || '',
    tipo: row['Tipo'] || '',
  }));

  return NextResponse.json({ agenda });
} catch (err: any) {
  return NextResponse.json({ error: err.message }, { status: 500 });
}
