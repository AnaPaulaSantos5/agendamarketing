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
  try {
    await auth();
    const sheet = doc.sheetsByTitle['Agenda'];
    const rows = await sheet.getRows();

    const data = rows.map((row) => ({
      Data_Inicio: row.Data_Inicio,
      Data_Fim: row.Data_Fim,
      Tipo_Evento: row.Tipo_Evento,
      Tipo: row.Tipo,
      Conteudo_Principal: row.Conteudo_Principal,
      Conteudo_Secundario: row.Conteudo_Secundario,
      CTA: row.CTA,
      Status_Postagem: row.Status_Postagem,
      Perfil: row.Perfil,
    }));

    return NextResponse.json({ Agenda: data });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await auth();
    const sheet = doc.sheetsByTitle['Agenda'];

    await sheet.addRow(body);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 });
  }
}