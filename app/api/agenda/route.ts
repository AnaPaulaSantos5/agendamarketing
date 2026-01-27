import { NextRequest, NextResponse } from "next/server";
import { getSpreadsheet } from "./spreadsheet";

export async function GET(req: NextRequest) {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Se você sabe os nomes das colunas, mapeie explicitamente
    const data = rows.map(row => ({
      id: row.index,        // índice público da linha (começa em 0)
      nome: row.Nome,       // substitua "Nome" pelo nome real da coluna na planilha
      email: row.Email,     // idem
      telefone: row.Telefone // idem
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar a agenda" }, { status: 500 });
  }
}