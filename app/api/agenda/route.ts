import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

const auth = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  return doc;
};

// GET – ler agenda
export async function GET() {
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  return NextResponse.json({
    Agenda: rows.map(r => ({
      Data_Inicio: r.Data_Inicio,
      Data_Fim: r.Data_Fim,
      Tipo_Evento: r.Tipo_Evento,
      Tipo: r.Tipo,
      Conteudo_Principal: r.Conteudo_Principal,
      Conteudo_Secundario: r.Conteudo_Secundario,
      CTA: r.CTA,
      Status_Postagem: r.Status_Postagem,
      Perfil: r.Perfil,
    })),
  });
}

// POST – salvar novo evento
export async function POST(req: Request) {
  const body = await req.json();
  const doc = await auth();
  const sheet = doc.sheetsByTitle['Agenda'];

  await sheet.addRow({
    Data_Inicio: body.Data_Inicio,
    Data_Fim: body.Data_Fim,
    Tipo_Evento: body.Tipo_Evento,
    Tipo: body.Tipo,
    Conteudo_Principal: body.Conteudo_Principal,
    Conteudo_Secundario: '',
    CTA: '',
    Status_Postagem: 'Pendente',
    Perfil: body.Perfil,
  });

  return NextResponse.json({ ok: true });
}