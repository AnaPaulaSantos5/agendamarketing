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

    // 4️⃣ Seleciona a aba “Agenda”
    const sheet = doc.sheetsByTitle['Agenda'];
    if (!sheet) {
      return NextResponse.json({ error: 'Aba Agenda não encontrada' }, { status: 404 });
    }

    // 5️⃣ Lê todas as linhas da aba
    const rows = await sheet.getRows();

    // 6️⃣ Mapeia os dados para um formato amigável
    const agenda = rows.map((row) => ({
      date: row['Data'] || '',                   // Data do post
      principal: row['Conteudo_Principal'] || '', // Conteúdo principal
      secundario: row['Conteudo_Secundario'] || '', // Conteúdo secundário
      tipo: row['Tipo'] || '',                   // Story, Reel, Post
      cta: row['CTA'] || '',                     // CTA
      status: row['Status'] || '',               // Pendente, Concluído...
    }));

    // 7️⃣ Retorna a agenda como JSON
    return NextResponse.json({ agenda });
  } catch (err: any) {
    console.error('Erro ao acessar Google Sheet:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

