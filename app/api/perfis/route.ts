export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSpreadsheet } from "../agenda/spreadsheet";

export async function GET() {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Perfil"];
  const rows = await sheet.getRows();

  return NextResponse.json(
    rows.map(r => ({
      perfil: r.Perfil,
      chatId: r.ChatId,
      image: r.Image,
    }))
  );
}

export async function PATCH(req: Request) {
  const { perfil, chatId } = await req.json();

  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Perfil"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r.Perfil === perfil);
  if (!row) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  row.ChatId = chatId;
  await row.save();

  return NextResponse.json({ success: true });
}
