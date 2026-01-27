// app/api/agenda/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";

// Pega as credenciais do service account do .env
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")!;

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Instancia a planilha
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);

    // 2️⃣ Autentica via Service Account
    await doc.useServiceAccountAuth({
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    });

    // 3️⃣ Carrega info da planilha
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // pega a primeira aba
    const rows = await sheet.getRows();

    // 4️⃣ Transformar os dados em JSON simples
    const data = rows.map((row, i) => ({
      id: i + 1,             // gera um ID sequencial
      nome: row.Nome,        // nome da coluna na planilha
      email: row.Email,      // nome da coluna na planilha
      telefone: row.Telefone // nome da coluna na planilha
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erro ao carregar agenda:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a agenda" },
      { status: 500 }
    );
  }
}