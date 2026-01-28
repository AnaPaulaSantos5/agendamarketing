import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function getSheet() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  return doc.sheetsByTitle['Agenda'];
}

export async function GET() {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  return NextResponse.json({
    Agenda: rows.map(row => ({
      Data: row.Data,
      Tipo: row.Tipo,
      Conteudo_Principal: row.Conteudo_Principal,
      Conteudo_Secundario: row.Conteudo_Secundario,
      CTA: row.CTA,
      Status_Postagem: row.Status_Postagem,
      Perfil: row.Perfil,
    })),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const sheet = await getSheet();

  await sheet.addRow({
    Data: body.start.split('T')[0].split('-').reverse().join('/'),
    Tipo: body.extendedProps?.type || 'Story',
    Conteudo_Principal: body.title,
    Conteudo_Secundario: '',
    CTA: 'Deseja falar com o marketing? ✅',
    Status_Postagem: 'Pendente',
    Perfil: body.extendedProps?.profile || 'Confi',
  });

  return NextResponse.json({ success: true });
}