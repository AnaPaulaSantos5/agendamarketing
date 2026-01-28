import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function GET() {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Agenda'];
    const rows = await sheet.getRows();

    const agenda = rows.map((row) => ({
      Data_Inicio: row.get('Data_Inicio'),
      Data_Fim: row.get('Data_Fim'),
      Tipo_Evento: row.get('Tipo_Evento'),
      Tipo: row.get('Tipo'),
      Conteudo_Principal: row.get('Conteudo_Principal'),
      Conteudo_Secundario: row.get('Conteudo_Secundario'),
      CTA: row.get('CTA'),
      Status_Postagem: row.get('Status_Postagem'),
      Perfil: row.get('Perfil'),
    }));

    return NextResponse.json({ Agenda: agenda });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Agenda'];

    await sheet.addRow({
      Data_Inicio: body.Data_Inicio,
      Data_Fim: body.Data_Fim,
      Tipo_Evento: body.Tipo_Evento,
      Tipo: body.Tipo,
      Conteudo_Principal: body.Conteudo_Principal,
      Conteudo_Secundario: body.Conteudo_Secundario,
      CTA: body.CTA,
      Status_Postagem: body.Status_Postagem,
      Perfil: body.Perfil,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao salvar evento' }, { status: 500 });
  }
}