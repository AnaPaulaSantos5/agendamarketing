import { NextResponse } from "next/server";
import { getSpreadsheet } from "../agenda/spreadsheet";

export async function GET() {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Perfil"];
  const rows = await sheet.getRows();

  return NextResponse.json(
    rows.map(r => ({
      id: r.Perfil,
      chatId: r.ChatId,
      image: r.Image,
    }))
  );
}
