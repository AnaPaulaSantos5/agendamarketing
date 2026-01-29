import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  auth
);

export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const events = rows.map((row, index) => ({
    id: index + 1,
    title: row.Conteudo_Principal || 'Evento',
    start: row.Data_Inicio,
    end: row.Data_Fim,
    tipoEvento: row.Tipo_Evento,
    tipo: row.Tipo,
    conteudoPrincipal: row.Conteudo_Principal,
    conteudoSecundario: row.Conteudo_Secundario,
    cta: row.CTA,
    statusPostagem: row.Status_Postagem,
    perfil: row.Perfil,
    checklist: row.Checklist
      ? JSON.parse(row.Checklist)
      : [],
  }));

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Data_Inicio: body.start,
      Data_Fim: body.end,
      Tipo_Evento: body.tipoEvento,
      Tipo: body.tipo,
      Conteudo_Principal: body.conteudoPrincipal,
      Conteudo_Secundario: body.conteudoSecundario,
      CTA: body.cta,
      Status_Postagem: body.statusPostagem,
      Perfil: body.perfil,
      Checklist: JSON.stringify(body.checklist || []),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Erro ao salvar' },
      { status: 500 }
    );
  }
}