import { NextRequest, NextResponse } from "next/server";
import { getSpreadsheet } from "./spreadsheet";

export async function GET(req: NextRequest) {
  try {
    const doc = await getSpreadsheet();

    // Aqui você escolhe a aba que quer
    const sheet = doc.sheetsByIndex[0]; // primeira aba
    const rows = await sheet.getRows();

    // Transformar os dados em JSON simples
    const data = rows.map(row => ({
      id: row._rowNumber,
      ...row._rawData, // ou mapeie as colunas específicas
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao acessar planilha:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a agenda" },
      { status: 500 }
    );
  }
}