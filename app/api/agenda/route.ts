// app/api/agenda/route.ts
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function GET() {
  try {
    // 1️⃣ Instancia a planilha
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

    // 2️⃣ Autentica via Service Account
    const authClient = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });

    // 3️⃣ Carrega informações da planilha
    await doc.loadInfo();

    // 4️⃣ Pega a aba "Agenda"
    const sheet = doc.sheetsByTitle['Agenda'];
    if (!sheet) {
      return NextResponse.json({ error: 'Aba "Agenda" não encontrada' }, { status: 404 });
    }

    // 5️⃣ Pega todas as linhas
    const rows = await sheet.getRows();

    // 6️⃣ Mapeia os dados
    const agenda = rows.map(row => ({
      date: row['Data'],                    // Nome exato da coluna
      principal: row['Conteudo_Principal'], // Nome exato da coluna
      secundario: row['Conteudo_Secundario'],
      tipo: row['Tipo'],                    // Story, Reel, Post
    }));

    return NextResponse.json({ agenda });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Erro desconhecido' }, { status: 500 });
  }
}
