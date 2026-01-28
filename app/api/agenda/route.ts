import { GoogleSpreadsheet } from 'google-spreadsheet';

/* =========================
   CONFIGURAÇÃO
========================= */

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function getSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['Agenda'];

  if (!sheet) {
    throw new Error('Aba "Agenda" não encontrada na planilha');
  }

  return sheet;
}

/* =========================
   GET → carregar agenda
========================= */

export async function GET() {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  const events = rows.map((row, index) => ({
    id: String(index),
    title: `${row.Tipo}: ${row.Conteudo_Principal}`,
    start: row.Data_Inicio,        // YYYY-MM-DD
    end: row.Data_Fim || row.Data_Inicio,
    allDay: true,
    extendedProps: {
      tipoEvento: row.Tipo_Evento,
      conteudoSecundario: row.Conteudo_Secundario,
      cta: row.CTA,
      status: row.Status_Postagem,
      perfil: row.Perfil,
    },
  }));

  return Response.json({ events });
}

/* =========================
   POST → salvar evento
========================= */

export async function POST(req: Request) {
  const body = await req.json();
  const sheet = await getSheet();

  await sheet.addRow({
    Data_Inicio: body.Data_Inicio,           // YYYY-MM-DD
    Data_Fim: body.Data_Fim || body.Data_Inicio,
    Tipo_Evento: body.Tipo_Evento || 'Conteúdo',
    Tipo: body.Tipo || 'Tarefa',
    Conteudo_Principal: body.Conteudo_Principal || '',
    Conteudo_Secundario: body.Conteudo_Secundario || '',
    CTA: body.CTA || '',
    Status_Postagem: body.Status_Postagem || 'Pendente',
    Perfil: body.Perfil || 'Confi',
  });

  return Response.json({ ok: true });
}