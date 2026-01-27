import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function GET() {
  try {
    // 1️⃣ Instancia a planilha (ID + segundo argumento vazio para TS)
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, {});

    // 2️⃣ Autentica via Service Account
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });

    // 3️⃣ Carrega as informações da planilha
    await doc.loadInfo();

    // 4️⃣ Acessa a aba "Agenda"
    const sheet = doc.sheetsByTitle['Agenda'];
    if (!sheet) {
      return NextResponse.json(
        { error: 'Aba "Agenda" não encontrada' },
        { status: 404 }
      );
    }

    // 5️⃣ Lê todas as linhas
    const rows = await sheet.getRows();

    // 6️⃣ Mapeia os dados da planilha para seu formato
    const agenda = rows.map(row => ({
      date: row['Data'],                     // Nome exato da coluna na planilha
      principal: row['Conteudo_Principal'],  // Nome exato da coluna
      secundario: row['Conteudo_Secundario'], 
      tipo: row['Tipo'],                      // Story, Reel, Post
    }));

    // 7️⃣ Retorna os dados como JSON
    return NextResponse.json({ agenda });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
