// app/api/agenda/route.ts
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Pega as variáveis do ambiente
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')!;

export async function GET() {
  try {
    // Cria o documento com o ID
    const doc = new GoogleSpreadsheet(SHEET_ID);

    // Autentica usando a conta de serviço
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });

    // Carrega informações do documento
    await doc.loadInfo();

    // Por exemplo, pega a primeira aba
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Retorna os dados como JSON
    const data = rows.map((row) => ({ ...row }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao acessar a planilha:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}