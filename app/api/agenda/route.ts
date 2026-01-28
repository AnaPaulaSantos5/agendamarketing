import { GoogleSpreadsheet } from 'google-spreadsheet';
import { NextResponse } from 'next/server';

/* =========================
   AUTENTICAÇÃO GOOGLE
========================= */
async function getDoc() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  return doc;
}

/* =========================
   GET — CARREGAR AGENDA
========================= */
export async function GET() {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Agenda'];
    const rows = await sheet.getRows();

    const eventos = rows.map((row) => ({
      Bloco_ID: row.Bloco_ID,
      title: row.Conteudo_Principal || 'Sem título',
      start: row.Data_Inicio, // YYYY-MM-DD
      end: row.Data_Fim,      // YYYY-MM-DD
      extendedProps: {
        Tipo_Evento: row.Tipo_Evento,
        Tipo: row.Tipo,
        Conteudo_Secundario: row.Conteudo_Secundario,
        CTA: row.CTA,
        Status_Postagem: row.Status_Postagem,
        Perfil: row.Perfil,
      },
    }));

    return NextResponse.json(eventos);
  } catch (error) {
    console.error('GET /api/agenda erro:', error);
    return NextResponse.json({ error: 'Erro ao carregar agenda' }, { status: 500 });
  }
}

/* =========================
   POST — CRIAR BLOCO
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.Data_Inicio || !body.Data_Fim) {
      return NextResponse.json(
        { error: 'Datas obrigatórias' },
        { status: 400 }
      );
    }

    const blocoId = Date.now().toString(); // ID único e persistente

    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Agenda'];

    await sheet.addRow({
      Bloco_ID: blocoId,
      Data_Inicio: body.Data_Inicio, // YYYY-MM-DD
      Data_Fim: body.Data_Fim,       // YYYY-MM-DD
      Tipo_Evento: body.Tipo_Evento || 'Campanha',
      Tipo: body.Tipo || '',
      Conteudo_Principal: body.Conteudo_Principal || '',
      Conteudo_Secundario: body.Conteudo_Secundario || '',
      CTA: body.CTA || '',
      Status_Postagem: body.Status_Postagem || 'Planejado',
      Perfil: body.Perfil || '',
    });

    return NextResponse.json({ ok: true, Bloco_ID: blocoId });
  } catch (error) {
    console.error('POST /api/agenda erro:', error);
    return NextResponse.json({ error: 'Erro ao salvar agenda' }, { status: 500 });
  }
}