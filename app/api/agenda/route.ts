import { NextResponse } from "next/server";
import { getSpreadsheet } from "./spreadsheet";

export async function GET() {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];

  const rows = await sheet.getRows();

  const events = rows.map((row, index) => ({
    id: row._rowNumber,
    title: row.Contenido_Principal || row.Conteudo_Principal,
    start: row.Data_Inicio,
    end: row.Data_Fim,
    perfil: row.Perfil,
    tipo: row.Tipo_Evento,
    cta: row.CTA,
    status: row.Status_Postagem,
  }));

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const data = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];

  await sheet.addRow(data);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { id, ...data } = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r._rowNumber === id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  Object.assign(row, data);
  await row.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle["Agenda"];
  const rows = await sheet.getRows();

  const row = rows.find(r => r._rowNumber === id);
  if (row) await row.delete();

  return NextResponse.json({ ok: true });
}
