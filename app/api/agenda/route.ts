export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSpreadsheet } from "./spreadsheet";

export async function GET() {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];
  const rows = await sheet.getRows();

  return NextResponse.json(
    rows.map(r => ({
      id: r.rowIndex,
      title: r.Conteudo_Principal,
      start: r.Data_Inicio,
      end: r.Data_Fim,
      perfil: r.Perfil,
    }))
  );
}

export async function POST(req: Request) {
  const data = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];

  await sheet.addRow(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { id, ...data } = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r.rowIndex === id);
  Object.assign(row, data);
  await row.save();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r.rowIndex === id);
  await row.delete();

  return NextResponse.json({ success: true });
}
