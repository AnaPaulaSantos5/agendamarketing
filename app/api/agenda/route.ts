import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

export async function GET() {
  try {
    // Autentica usando a service account
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo(); // carrega informações da planilha
    const sheet = doc.sheetsByIndex[0]; // primeira aba
    const rows = await sheet.getRows();

    // Transformar em JSON simples com os nomes corretos das colunas
    const data = rows.map((row) => ({
      nome: row.Nome,        // use exatamente o título da coluna na planilha
      email: row.Email,
      telefone: row.Telefone,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao carregar agenda:", error);
    return NextResponse.json({ error: "Erro ao carregar agenda" }, { status: 500 });
  }
}