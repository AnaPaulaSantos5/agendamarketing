import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  auth
);

/* =========================
   GET — CARREGAR AGENDA
========================= */
export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  const events = rows.map((row: any) => ({
    title: `${row.Tipo}: ${row.Conteudo_Principal}`,
    start: row.Data_Inicio,
    end: row.Data_Fim || row.Data_Inicio,
  }));

  return NextResponse.json(events);
}

/* =========================
   POST — CRIAR EVENTO + TAREFAS
========================= */
export async function POST(req: Request) {
  const body = await req.json();

  await doc.loadInfo();

  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  // ID único para ligar Agenda ↔ Tarefas
  const blocoId = `BL-${Date.now()}`;

  // 🔹 Salva na Agenda
  await agendaSheet.addRow({
    Bloco_ID: blocoId,
    ...body,
  });

  // 🔹 Cria tarefas automaticamente
  await tarefasSheet.addRows([
    {
      Bloco_ID: blocoId,
      Tarefa: 'Criar arte',
      Status: 'Pendente',
      Perfil: body.Perfil,
    },
    {
      Bloco_ID: blocoId,
      Tarefa: 'Revisar conteúdo',
      Status: 'Pendente',
      Perfil: body.Perfil,
    },
    {
      Bloco_ID: blocoId,
      Tarefa: 'Publicar',
      Status: 'Pendente',
      Perfil: body.Perfil,
    },
  ]);

  return NextResponse.json({ success: true });
}