import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

async function auth() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
}

export async function GET() {
  await auth();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  const data = rows
    .filter(r => r.Data_Inicio) // 👈 evita linhas quebradas
    .map(r => ({
      Data_Inicio: r.Data_Inicio, // ISO STRING
      Data_Fim: r.Data_Fim || r.Data_Inicio,
      Tipo_Evento: r.Tipo_Evento,
      Tipo: r.Tipo,
      Conteudo_Principal: r.Conteudo_Principal,
      Conteudo_Secundario: r.Conteudo_Secundario,
      CTA: r.CTA,
      Status_Postagem: r.Status_Postagem,
      Perfil: r.Perfil,
    }));

  return NextResponse.json({ Agenda: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  await auth();
  const sheet = doc.sheetsByTitle['Agenda'];

  // ⚠️ FORÇA ISO STRING
  await sheet.addRow({
    ...body,
    Data_Inicio: String(body.Data_Inicio),
    Data_Fim: String(body.Data_Fim),
  });

  return NextResponse.json({ ok: true });
}