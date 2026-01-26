import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";

// Função para limpar a private key
function cleanPrivateKey(key: string): string {
  return key
    .trim()                  // remove espaços no início e fim
    .replace(/\r/g, "")      // remove carriage returns invisíveis
    .replace(/\t/g, "")      // remove tabs
    .replace(/\\n/g, "\n");  // transforma "\n" literal em quebra real
}

// Lê variáveis do .env e limpa se necessário
const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim()!;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()!;
const PRIVATE_KEY = cleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY!);

export async function GET() {
  try {
    // Cria documento passando apenas o ID
    const doc = new GoogleSpreadsheet(SHEET_ID);

    // Autenticação com credenciais limpas
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });

    await doc.loadInfo(); // Carrega info do spreadsheet
    const sheet = doc.sheetsByIndex[0]; // pega a primeira aba
    const rows = await sheet.getRows();

    // Retorna os dados como JSON
    const data = rows.map((row) => row._rawData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao acessar Google Spreadsheet:", error);
    return NextResponse.json({ error: "Falha ao acessar a planilha" }, { status: 500 });
  }
}