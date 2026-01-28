import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string);

export async function GET() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
    private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  const data = rows.map(row => ({
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

  return Response.json({ Agenda: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
    private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  });

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

  return Response.json({ success: true });
}