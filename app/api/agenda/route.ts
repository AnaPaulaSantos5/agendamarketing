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

/* =====================
   GET — CARREGAR AGENDA
===================== */
export async function GET() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Agenda'];
  const rows = await sheet.getRows();

  const events = rows
    .filter((r: any) => r.Data_Inicio)
    .map((row: any) => ({
      id: row.Bloco_ID,
      title: `${row.Tipo} - ${row.Conteudo_Principal}`,
      start: new Date(row.Data_Inicio).toISOString(),
      end: row.Data_Fim
        ? new Date(row.Data_Fim).toISOString()
        : new Date(row.Data_Inicio).toISOString(),
      extendedProps: {
        perfil: row.Perfil,
        status: row.Status_Postagem,
      },
    }));

  return NextResponse.json(events);
}

/* =====================
   POST — SALVAR AGENDA
===================== */
export async function POST(req: Request) {
  const body = await req.json();
  await doc.loadInfo();

  const agendaSheet = doc.sheetsByTitle['Agenda'];
  const tarefasSheet = doc.sheetsByTitle['Tarefas'];

  const blocoId = `BL-${Date.now()}`;

  // 🔹 AGENDA
  await agendaSheet.addRow({
    Bloco_ID: blocoId,
    ...body,
  });

  // 🔹 TAREFAS AUTOMÁTICAS
  await tarefasSheet.addRows([
    {
      Bloco_ID: blocoId,
      Tarefa: 'Criar arte',
      Status: 'Pendente',
      Perfil: body.Perfil,
    },
    {
      Bloco_ID: blocoId,
      Tarefa: 'Revisar',
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