import { NextResponse } from "next/server";
import { getSpreadsheet } from "../../agenda/spreadsheet";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { chatId } = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Perfil"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r.Perfil === params.id);
  if (!row) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  row.ChatId = chatId;
  await row.save();

  return NextResponse.json({
    id: row.Perfil,
    chatId: row.ChatId,
  });
}
