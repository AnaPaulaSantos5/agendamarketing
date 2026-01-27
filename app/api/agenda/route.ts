import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");

export async function GET() {
  try {
    // 1️⃣ Instancia a planilha
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);

    // 2️⃣ Autentica via Service Account
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // carrega infos da planilha

    // 3️⃣ Pega todas as abas
    const allSheetsData = {};

    for (const sheet of doc.sheetsByIndex) {
      await sheet.loadHeaderRow(); // garante que os títulos de coluna estejam carregados
      const rows = await sheet.getRows();
      
      // Mapeia cada linha transformando em JSON simples
      allSheetsData[sheet.title] = rows.map((row) => {
        const obj: Record<string, any> = {};
        sheet.headerValues.forEach((header) => {
          obj[header] = row[header];
        });
        return obj;
      });
    }

    return NextResponse.json(allSheetsData);
  } catch (error) {
    console.error("Erro ao carregar agenda:", error);
    return NextResponse.json({ error: "Não foi possível carregar a agenda" }, { status: 500 });
  }
}